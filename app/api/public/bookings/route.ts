import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      customerName,
      customerEmail,
      customerPhone,
      userId,
    } = body

    if (!serviceId || !staffId || !appointmentDate || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + service.durationMinutes * 60000)

    let customerId: number
    const session = await getSessionUser()

    if (session?.role === "CUSTOMER") {
      customerId = session.id
    } else if (userId) {
      customerId = parseInt(userId)
    } else if (customerEmail) {
      const existing = await prisma.user.findUnique({ where: { email: customerEmail } })
      if (existing) {
        customerId = existing.id
        if (customerPhone && !existing.phone) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { phone: customerPhone },
          })
        }
      } else {
        if (!customerName || !customerEmail) {
          return NextResponse.json(
            { error: "Name and email are required for guest booking" },
            { status: 400 },
          )
        }
        const guest = await prisma.user.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone || null,
            password: await hash(`guest-${Date.now()}-${Math.random()}`, 10),
            role: "CUSTOMER",
          },
        })
        customerId = guest.id
      }
    } else {
      return NextResponse.json({ error: "Customer information required" }, { status: 400 })
    }

    const conflicting = await prisma.appointment.findFirst({
      where: {
        staffId: parseInt(staffId),
        appointmentDate: new Date(appointmentDate),
        status: { not: "CANCELLED" },
        OR: [{ startTime: { lt: endDateTime }, endTime: { gt: startDateTime } }],
      },
    })

    if (conflicting) {
      return NextResponse.json(
        { error: "Selected time slot is no longer available" },
        { status: 409 },
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        staffId: parseInt(staffId),
        appointmentDate: new Date(appointmentDate),
        startTime: startDateTime,
        endTime: endDateTime,
        status: "PENDING",
        services: {
          create: {
            serviceId: parseInt(serviceId),
            price: service.price,
            durationMinutes: service.durationMinutes,
          },
        },
      },
      include: {
        services: { include: { service: true } },
        staff: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      message: "Booking created successfully",
      appointment,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
