import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import type { PaymentStatus } from "@prisma/client"

function formatPayment(payment: {
  id: number
  appointmentId: number
  amount: number
  status: PaymentStatus
  method: string
  createdAt: Date
  appointment: {
    customer: { name: string }
    services: { service: { name: string } }[]
  }
}) {
  const serviceName =
    payment.appointment.services.map((s) => s.service.name).join(", ") || "Appointment"

  return {
    id: payment.id,
    appointmentId: payment.appointmentId,
    clientName: payment.appointment.customer.name,
    serviceName,
    amount: payment.amount,
    status: payment.status.toLowerCase(),
    date: payment.createdAt.toISOString().split("T")[0],
    method: payment.method,
  }
}

export async function GET() {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            customer: { select: { name: true } },
            services: { include: { service: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: payments.map(formatPayment) })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 })
    }

    const normalized = status.toUpperCase() as PaymentStatus

    const existing = await prisma.payment.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (normalized === "REFUNDED" && existing.status !== "PAID") {
      return NextResponse.json({ error: "Only paid payments can be refunded" }, { status: 400 })
    }

    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status: normalized },
      include: {
        appointment: {
          include: {
            customer: { select: { name: true } },
            services: { include: { service: { select: { name: true } } } },
          },
        },
      },
    })

    return NextResponse.json(formatPayment(payment))
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
