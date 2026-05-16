"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Star } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Appointment = {
  id: number
  serviceName: string
  date: string
  time: string
  status: string
  staffName: string
  review?: { id: number; rating: number; comment: string | null } | null
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  })
  const [reviewForm, setReviewForm] = useState<{
    appointmentId: number
    rating: number
    comment: string
  } | null>(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/appointments", { credentials: "include" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to load appointments")
      }
      setAppointments(data.data ?? [])
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load appointments",
        variant: "destructive",
      })
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleCancel = async (id: number) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: "cancelled" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      fetchAppointments()
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      })
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to cancel appointment.",
        variant: "destructive",
      })
    }
    setConfirmModal({ open: false, id: 0 })
  }

  const submitReview = async () => {
    if (!reviewForm) return
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" })
      setReviewForm(null)
      fetchAppointments()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const canCancel = (status: string) => status === "pending" || status === "confirmed"
  const isCompleted = (status: string) => status === "completed"

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Appointments</h2>
          <p className="text-muted-foreground">View, cancel, or review your bookings</p>
        </div>
        <Button className="bg-primary text-white hover:bg-[#B2223A]" asChild>
          <Link href="/book">Book New</Link>
        </Button>
      </motion.div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="mb-4 text-muted-foreground">No appointments found.</p>
          <Button className="bg-primary text-white hover:bg-[#B2223A]" asChild>
            <Link href="/book">Book an Appointment</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-muted-foreground">with {appointment.staffName}</p>
                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-800">
                    {appointment.status}
                  </span>
                  {appointment.review && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      Your review: {"★".repeat(appointment.review.rating)} —{" "}
                      {appointment.review.comment || "No comment"}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canCancel(appointment.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmModal({ open: true, id: appointment.id })}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  {isCompleted(appointment.status) && !appointment.review && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setReviewForm({
                          appointmentId: appointment.id,
                          rating: 5,
                          comment: "",
                        })
                      }
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>

              {reviewForm?.appointmentId === appointment.id && (
                <div className="mt-4 space-y-3 rounded-lg border p-4">
                  <div>
                    <label className="text-sm font-medium">Rating (1-5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={reviewForm.rating}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      rows={3}
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitReview}>
                      Submit Review
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReviewForm(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        open={confirmModal.open}
        title="Cancel Appointment?"
        description="Are you sure you want to cancel this appointment?"
        actionLabel="Cancel Appointment"
        isDestructive
        onConfirm={() => handleCancel(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: 0 })}
      />
    </motion.div>
  )
}
