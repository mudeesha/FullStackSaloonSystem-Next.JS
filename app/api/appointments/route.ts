import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import { formatAppointmentForUi } from "@/lib/appointment-format"
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

    const where: Record<string, unknown> = {}

    if (auth.session.role === "CUSTOMER") {
      where.customerId = auth.session.id
    } else if (auth.session.role === "STAFF") {
      where.staffId = auth.session.id
    }

    if (status && status !== "all") {
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

    if (auth.session.role === "CUSTOMER") {
      if (appointment.customerId !== auth.session.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (normalizedStatus !== "CANCELLED") {
        return NextResponse.json({ error: "Customers can only cancel appointments" }, { status: 403 })
      }
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
