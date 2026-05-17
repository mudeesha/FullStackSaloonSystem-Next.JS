"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/search-bar"
import { matchesListSearch } from "@/lib/list-search"

type Appointment = {
  id: number
  serviceName: string
  date: string
  time: string
  status: string
  staffName: string
  review?: { id: number; rating: number; comment: string | null } | null
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [search, setSearch] = useState("")
  const [reviewForm, setReviewForm] = useState<{ appointmentId: number; rating: number; comment: string } | null>(null)

  const fetchAppointments = () => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.data ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const completedAppointments = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed")
    return completed.filter((a) =>
      matchesListSearch(search, [a.id, a.serviceName, a.staffName, a.date, a.time]),
    )
  }, [appointments, search])

  const submitReview = async () => {
    if (!reviewForm) return
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed")
      }
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-3xl font-bold">Booking History</h2>
        <p className="mb-4 text-muted-foreground">View past appointments and leave reviews</p>
        <SearchBar onSearch={setSearch} placeholder="Search by ID, service, staff, date..." />
      </div>

      <div className="space-y-4">
        {completedAppointments.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {search ? "No appointments match your search." : "No completed appointments yet."}
          </Card>
        ) : (
          completedAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className="mb-1 inline-block rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
                    Appointment #{appointment.id}
                  </span>
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-muted-foreground">with {appointment.staffName}</p>
                  {appointment.review && (
                    <p className="text-sm mt-2 text-yellow-600">
                      Your review: {"★".repeat(appointment.review.rating)} — {appointment.review.comment}
                    </p>
                  )}
                </div>
                {!appointment.review && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setReviewForm({ appointmentId: appointment.id, rating: 5, comment: "" })
                    }
                  >
                    Leave Review
                  </Button>
                )}
              </div>

              {reviewForm?.appointmentId === appointment.id && (
                <div className="mt-4 p-4 border rounded-lg space-y-3">
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
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitReview}>
                      Submit Review
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReviewForm(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
