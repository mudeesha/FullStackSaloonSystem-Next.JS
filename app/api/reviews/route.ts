import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

function formatReview(review: {
  id: number
  appointmentId: number
  rating: number
  comment: string | null
  createdAt: Date
  appointment: { customer: { name: string } }
}) {
  return {
    id: review.id,
    appointmentId: review.appointmentId,
    clientName: review.appointment.customer.name,
    rating: review.rating,
    comment: review.comment ?? "",
    date: review.createdAt.toISOString().split("T")[0],
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get("public") === "true"

    if (!publicOnly) {
      const auth = await requireSession(["ADMIN"])
      if (!auth.session) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
      }
    }

    const reviews = await prisma.review.findMany({
      include: {
        appointment: {
          include: { customer: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: publicOnly ? 6 : undefined,
    })

    const data = reviews.map(formatReview)

    if (publicOnly) {
      return NextResponse.json({
        data: data.map((r) => ({
          id: r.id,
          name: r.clientName,
          text: r.comment || "Great experience!",
          rating: r.rating,
        })),
      })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession(["CUSTOMER", "ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { appointmentId, rating, comment } = await request.json()

    if (!appointmentId || !rating) {
      return NextResponse.json({ error: "Appointment ID and rating are required" }, { status: 400 })
    }

    const ratingNum = Number(rating)
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: { review: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (auth.session.role === "CUSTOMER" && appointment.customerId !== auth.session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (appointment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only review completed appointments" }, { status: 400 })
    }

    if (appointment.review) {
      return NextResponse.json({ error: "Review already exists for this appointment" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        appointmentId: Number(appointmentId),
        rating: ratingNum,
        comment: comment || null,
      },
      include: {
        appointment: { include: { customer: { select: { name: true } } } },
      },
    })

    return NextResponse.json(formatReview(review), { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    await prisma.review.delete({ where: { id: Number(id) } })
    return NextResponse.json({ message: "Review deleted" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
