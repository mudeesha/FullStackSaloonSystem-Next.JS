import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

function formatReview(review: {
  id: number
  appointmentId: number
  rating: number
  comment: string | null
  createdAt: Date
  appointment: {
    customer: { name: string }
    staff: { name: string }
    services: { service: { name: string } }[]
  }
}) {
  const serviceName =
    review.appointment.services.map((s) => s.service.name).join(", ") || "Service"

  return {
    id: review.id,
    appointmentId: review.appointmentId,
    clientName: review.appointment.customer.name,
    staffName: review.appointment.staff.name,
    serviceName,
    rating: review.rating,
    comment: review.comment ?? "",
    date: review.createdAt.toISOString().split("T")[0],
  }
}

const reviewInclude = {
  appointment: {
    include: {
      customer: { select: { name: true } },
      staff: { select: { name: true } },
      services: { include: { service: { select: { name: true } } } },
    },
  },
} as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get("public") === "true"
    const search = (searchParams.get("search") || "").trim().toLowerCase()
    const staffOnly = searchParams.get("staff") === "true"

    if (!publicOnly) {
      const auth = await requireSession(["ADMIN", "STAFF"])
      if (!auth.session) {
        return NextResponse.json({ error: auth.error }, { status: auth.status })
      }

      const where =
        staffOnly && auth.session.role === "STAFF"
          ? { appointment: { staffId: auth.session.id } }
          : {}

      const reviews = await prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: "desc" },
      })

      let data = reviews.map(formatReview)

      if (search) {
        data = data.filter(
          (r) =>
            r.clientName.toLowerCase().includes(search) ||
            r.staffName.toLowerCase().includes(search) ||
            r.serviceName.toLowerCase().includes(search) ||
            r.comment.toLowerCase().includes(search) ||
            String(r.rating).includes(search),
        )
      }

      return NextResponse.json({ data })
    }

    const reviews = await prisma.review.findMany({
      include: reviewInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    })

    const data = reviews.map(formatReview)

    return NextResponse.json({
      data: data.map((r) => ({
        id: r.id,
        name: r.clientName,
        text: r.comment || "Great experience!",
        rating: r.rating,
      })),
    })
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
      include: reviewInclude,
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
