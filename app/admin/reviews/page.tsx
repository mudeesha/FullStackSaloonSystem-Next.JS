"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Search } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Review = {
  id: number
  appointmentId: number
  clientName: string
  staffName: string
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
      r.staffName.toLowerCase().includes(search) ||
      r.serviceName.toLowerCase().includes(search) ||
      r.comment.toLowerCase().includes(search) ||
      String(r.rating).includes(search),
  )
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({ open: false, id: 0 })

  const reviews = useMemo(() => filterReviews(allReviews, search), [allReviews, search])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/reviews", { credentials: "include" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setAllReviews(data.data ?? [])
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load reviews",
        variant: "destructive",
      })
      setAllReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) throw new Error("Failed")
      fetchReviews()
      toast({ title: "Review Deleted", description: "Review has been removed." })
    } catch {
      toast({ title: "Error", description: "Failed to delete review.", variant: "destructive" })
    }
    setConfirmModal({ open: false, id: 0 })
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Reviews</h2>
          <p className="text-muted-foreground">Client feedback with staff and service details</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, staff, service, comment..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex justify-between gap-4 rounded-lg border bg-card p-6">
              <div>
                <p className="font-semibold">{review.clientName}</p>
                <p className="mt-1 text-sm text-primary">
                  Staff: <span className="font-medium">{review.staffName}</span>
                </p>
                <p className="text-sm text-muted-foreground">{review.serviceName}</p>
                <p className="mt-2 text-yellow-500">{"★".repeat(review.rating)}</p>
                <p className="mt-2 text-muted-foreground">{review.comment || "No comment"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => setConfirmModal({ open: true, id: review.id })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={confirmModal.open}
        title="Delete Review?"
        description="Are you sure you want to delete this review?"
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: 0 })}
      />
    </motion.div>
  )
}
