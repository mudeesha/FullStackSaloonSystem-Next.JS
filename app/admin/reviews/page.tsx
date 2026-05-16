"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Review = {
  id: number
  appointmentId: number
  clientName: string
  rating: number
  comment: string
  date: string
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({ open: false, id: 0 })

  const fetchReviews = () => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data.data ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" })
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
      <h2 className="text-3xl font-bold">Reviews</h2>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 rounded-lg border bg-card flex justify-between">
            <div>
              <p className="font-semibold">{review.clientName}</p>
              <p className="text-yellow-500">{"★".repeat(review.rating)}</p>
              <p className="text-muted-foreground mt-2">{review.comment}</p>
              <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => setConfirmModal({ open: true, id: review.id })}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

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
