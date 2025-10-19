"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { mockReviews } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Star, Trash2 } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState(mockReviews)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  })

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((r) => r.id !== id))
    toast({
      title: "Review Deleted",
      description: "Review has been removed.",
    })
    setConfirmModal({ open: false, id: 0 })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold mb-2">Reviews</h2>
        <p className="text-muted-foreground">Manage customer reviews</p>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">{review.clientName}</h3>
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-2">"{review.comment}"</p>
                <p className="text-xs text-muted-foreground">
                  Appointment #{review.appointmentId} • {review.date}
                </p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => setConfirmModal({ open: true, id: review.id })}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmationModal
        open={confirmModal.open}
        title="Delete Review?"
        description="Are you sure you want to delete this review? This action cannot be undone."
        actionLabel="Delete"
        isDestructive
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: 0 })}
      />
    </div>
  )
}
