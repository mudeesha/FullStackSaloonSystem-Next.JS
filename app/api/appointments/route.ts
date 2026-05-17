import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import { formatAppointmentForUi } from "@/lib/appointment-format"
import { canTransition } from "@/lib/appointment-status"
import type { AppointmentStatus } from "@prisma/client"

const appointmentInclude = {
  customer: { select: { id: true, name: true, email: true, phone: true } },
  staff: { select: { id: true, name: true, email: true, phone: true } },
  services: { include: { service: true } },
  payment: true,
  review: true,
} as const

export async function GET(request: Request) {
  try {
    const auth = await requireSession()
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const today = searchParams.get("today") === "true"
    const upcoming = searchParams.get("upcoming") === "true"
    const history = searchParams.get("history") === "true"

    const staffScope = searchParams.get("staff") === "true"
    const where: Record<string, unknown> = {}

    if (auth.session.role === "CUSTOMER") {
      where.customerId = auth.session.id
    } else if (auth.session.role === "STAFF" || staffScope) {
      where.staffId = auth.session.id
    }

    if (upcoming) {
      where.status = { in: ["PENDING", "CONFIRMED"] }
    } else if (history) {
      where.status = { in: ["COMPLETED", "CANCELLED"] }
    } else if (status && status !== "all") {
      where.status = status.toUpperCase() as AppointmentStatus
    }

    if (today) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      where.appointmentDate = { gte: start, lte: end }
    } else if (date) {
      const day = new Date(date)
      const start = new Date(day)
      start.setHours(0, 0, 0, 0)
      const end = new Date(day)
      end.setHours(23, 59, 59, 999)
      where.appointmentDate = { gte: start, lte: end }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json({
      data: appointments.map(formatAppointmentForUi),
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession(["CUSTOMER", "ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { serviceId, staffId, appointmentDate, startTime, notes, customerId } = body

    if (!serviceId || !staffId || !appointmentDate || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } })
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const resolvedCustomerId =
      auth.session.role === "ADMIN" && customerId ? Number(customerId) : auth.session.id

    const startDateTime = new Date(`${appointmentDate}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + service.durationMinutes * 60000)

    const conflicting = await prisma.appointment.findFirst({
      where: {
        staffId: Number(staffId),
        appointmentDate: new Date(appointmentDate),
        status: { not: "CANCELLED" },
        OR: [{ startTime: { lt: endDateTime }, endTime: { gt: startDateTime } }],
      },
    })

    if (conflicting) {
      return NextResponse.json({ error: "Selected time slot is no longer available" }, { status: 409 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: resolvedCustomerId,
        staffId: Number(staffId),
        appointmentDate: new Date(appointmentDate),
        startTime: startDateTime,
        endTime: endDateTime,
        status: "PENDING",
        notes: notes || null,
        services: {
          create: {
            serviceId: Number(serviceId),
            price: service.price,
            durationMinutes: service.durationMinutes,
          },
        },
      },
      include: appointmentInclude,
    })

    return NextResponse.json(formatAppointmentForUi(appointment), { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSession()
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 })
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } })
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const normalizedStatus = status.toUpperCase() as AppointmentStatus

    if (auth.session.role === "STAFF" && appointment.staffId !== auth.session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (auth.session.role === "CUSTOMER" && appointment.customerId !== auth.session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const transition = canTransition(appointment.status, normalizedStatus, auth.session.role)
    if (!transition.ok) {
      return NextResponse.json({ error: transition.error }, { status: 400 })
    }

    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status: normalizedStatus },
      include: appointmentInclude,
    })

    if (normalizedStatus === "COMPLETED") {
      const amount = updated.services.reduce((sum, s) => sum + s.price, 0)
      await prisma.payment.upsert({
        where: { appointmentId: updated.id },
        create: {
          appointmentId: updated.id,
          amount,
          status: "PENDING",
          method: "CASH",
        },
        update: {},
      })
    }

    return NextResponse.json(formatAppointmentForUi(updated))
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}
