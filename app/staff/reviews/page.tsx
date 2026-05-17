"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Star, Search } from "lucide-react"

type Review = {
  id: number
  clientName: string
  serviceName: string
  rating: number
  comment: string
  date: string
}

function filterReviews(reviews: Review[], query: string) {
  const search = query.trim().toLowerCase()
  if (!search) return reviews
  return reviews.filter(
    (r) =>
      r.clientName.toLowerCase().includes(search) ||
      r.serviceName.toLowerCase().includes(search) ||
      r.comment.toLowerCase().includes(search) ||
      String(r.rating).includes(search),
  )
}

export default function StaffReviewsPage() {
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const reviews = useMemo(() => filterReviews(allReviews, search), [allReviews, search])

  useEffect(() => {
    fetch("/api/reviews?staff=true", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAllReviews(data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold">My Reviews</h2>
          <p className="text-muted-foreground">Feedback from clients on your completed appointments</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, service, comment..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {search
            ? "No reviews match your search."
            : "No reviews yet. Reviews appear after clients rate completed appointments."}
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