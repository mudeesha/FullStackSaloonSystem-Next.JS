// app/api/bookings/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
      customerPhone
    } = body

    if (!serviceId || !staffId || !appointmentDate || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + service.durationMinutes * 60000)

    // Create or find customer (you might want to create a guest user or use auth)
    let customerId: number

    // For now, create a temporary customer record
    // In production, you'd use your auth system
    const customer = await prisma.user.create({
      data: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        password: 'temporary', // You should handle this differently
        role: 'CUSTOMER'
      }
    })
    customerId = customer.id

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customerId,
        staffId: parseInt(staffId),
        appointmentDate: new Date(appointmentDate),
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'PENDING',
        services: {
          create: {
            serviceId: parseInt(serviceId),
            price: service.price,
            durationMinutes: service.durationMinutes
          }
        }
      },
      include: {
        services: {
          include: {
            service: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: "Booking created successfully",
      appointment 
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}