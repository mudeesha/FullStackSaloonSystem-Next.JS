"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { ConfirmationModal } from "@/components/confirmation-modal"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type Schedule = Record<string, { start: string; end: string; available: boolean }>

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<Schedule>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) setSchedule(data.schedule)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (day: string, field: string, value: string | boolean) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    })
  }

  const confirmSave = async () => {
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Schedule Updated", description: "Your availability has been updated successfully." })
    } catch {
      toast({ title: "Error", description: "Failed to update availability.", variant: "destructive" })
    }
    setShowConfirm(false)
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading schedule...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Availability</h2>
        <p className="text-muted-foreground">Set your working hours</p>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day} className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="font-semibold w-24">{day}</p>
              <div className="flex items-center gap-4 flex-1 flex-wrap">
                <div>
                  <label className="text-sm text-muted-foreground">Start</label>
                  <Input
                    type="time"
                    value={schedule[day]?.start || "09:00"}
                    onChange={(e) => handleChange(day, "start", e.target.value)}
                    className="w-28"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End</label>
                  <Input
                    type="time"
                    value={schedule[day]?.end || "17:00"}
                    onChange={(e) => handleChange(day, "end", e.target.value)}
                    className="w-28"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={schedule[day]?.available ?? false}
                    onChange={(e) => handleChange(day, "available", e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  Available
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={() => setShowConfirm(true)} className="w-full">
        Save Schedule
      </Button>

      <ConfirmationModal
        open={showConfirm}
        title="Update Availability?"
        description="Are you sure you want to update your availability schedule?"
        actionLabel="Update"
        onConfirm={confirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
