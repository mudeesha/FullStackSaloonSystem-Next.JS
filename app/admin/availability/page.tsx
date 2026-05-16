"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit } from "lucide-react"
import { FormModal } from "@/components/form-modal"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type DaySchedule = { start: string; end: string; available: boolean }
type StaffSchedule = {
  id: number
  name: string
  email: string
  schedule: Record<string, DaySchedule>
}

export default function AdminAvailabilityPage() {
  const { toast } = useToast()
  const [staffList, setStaffList] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<{ open: boolean; staffId?: number }>({ open: false })
  const [editSchedule, setEditSchedule] = useState<Record<string, DaySchedule>>({})

  const fetchStaff = () => {
    fetch("/api/availability?allStaff=true")
      .then((res) => res.json())
      .then((data) => setStaffList(data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleOpenEdit = (staff: StaffSchedule) => {
    setEditModal({ open: true, staffId: staff.id })
    setEditSchedule({ ...staff.schedule })
  }

  const handleDayChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setEditSchedule({
      ...editSchedule,
      [day]: { ...editSchedule[day], [field]: value },
    })
  }

  const handleSave = async () => {
    if (!editModal.staffId) return
    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: editModal.staffId, schedule: editSchedule }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Availability Updated", description: "Staff schedule saved successfully." })
      fetchStaff()
      setEditModal({ open: false })
    } catch {
      toast({ title: "Error", description: "Failed to update availability.", variant: "destructive" })
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading staff schedules...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Staff Availability</h2>
        <p className="text-muted-foreground">View and manage staff schedules</p>
      </div>

      <div className="space-y-6">
        {staffList.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No staff members found.</Card>
        ) : (
          staffList.map((staff) => (
            <Card key={staff.id} className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{staff.name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(staff)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Schedule
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {days.map((day) => {
                  const slot = staff.schedule[day]
                  return (
                    <div key={day} className="p-3 rounded-lg bg-muted">
                      <p className="font-medium text-sm">{day}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot?.available ? `${slot.start} - ${slot.end}` : "Off"}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        )}
      </div>

      <FormModal
        open={editModal.open}
        title="Edit Staff Availability"
        description="Set weekly working hours for this staff member"
        onClose={() => setEditModal({ open: false })}
        onSubmit={handleSave}
        submitLabel="Save Schedule"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {days.map((day) => (
            <div key={day} className="flex flex-wrap items-center gap-3 p-3 border rounded-lg">
              <span className="w-24 font-medium text-sm">{day}</span>
              <Input
                type="time"
                value={editSchedule[day]?.start || "09:00"}
                onChange={(e) => handleDayChange(day, "start", e.target.value)}
                className="w-28"
                disabled={!editSchedule[day]?.available}
              />
              <Input
                type="time"
                value={editSchedule[day]?.end || "17:00"}
                onChange={(e) => handleDayChange(day, "end", e.target.value)}
                className="w-28"
                disabled={!editSchedule[day]?.available}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editSchedule[day]?.available ?? false}
                  onChange={(e) => handleDayChange(day, "available", e.target.checked)}
                />
                Available
              </label>
            </div>
          ))}
        </div>
      </FormModal>
    </div>
  )
}
