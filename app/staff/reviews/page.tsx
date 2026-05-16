"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

type Review = {
  id: number
  clientName: string
  serviceName: string
  rating: number
  comment: string
  date: string
}

export default function StaffReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reviews?staff=true", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setReviews(data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-3xl font-bold">My Reviews</h2>
        <p className="text-muted-foreground">Feedback from clients on your completed appointments</p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No reviews yet. Reviews appear after clients rate completed appointments.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-card p-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{review.clientName}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <p className="mb-1 text-sm text-muted-foreground">{review.serviceName}</p>
              <p className="mb-2 flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-yellow-500" />
                {"★".repeat(review.rating)}
                <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
              </p>
              <p className="text-muted-foreground">{review.comment || "No comment provided."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
