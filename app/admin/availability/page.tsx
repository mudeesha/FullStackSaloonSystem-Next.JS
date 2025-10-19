"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockStaff } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Edit } from "lucide-react"
import { FormModal } from "@/components/form-modal"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AdminAvailabilityPage() {
  const { toast } = useToast()
  const [editModal, setEditModal] = useState<{ open: boolean; staffId?: number }>({ open: false })
  const [editData, setEditData] = useState({ start: "09:00", end: "17:00" })
  const [staffSchedules, setStaffSchedules] = useState(
    mockStaff.reduce(
      (acc, staff) => ({
        ...acc,
        [staff.id]: days.reduce(
          (dayAcc, day) => ({
            ...dayAcc,
            [day]: { start: "09:00", end: "17:00", available: true },
          }),
          {},
        ),
      }),
      {},
    ),
  )

  const handleOpenEdit = (staffId: number) => {
    setEditModal({ open: true, staffId })
    setEditData({ start: "09:00", end: "17:00" })
  }

  const handleSaveAvailability = () => {
    if (editModal.staffId) {
      toast({
        title: "Availability Updated",
        description: "Staff availability has been updated successfully.",
      })
    }
    setEditModal({ open: false })
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
        <h2 className="text-3xl font-bold mb-2">Staff Availability</h2>
        <p className="text-muted-foreground">View and manage staff schedules</p>
      </motion.div>

      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        {mockStaff.map((staff, staffIndex) => (
          <motion.div key={staff.id} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{staff.name}</h3>
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(staff.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Schedule
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {days.map((day) => (
                  <div key={day} className="p-3 rounded-lg bg-muted">
                    <p className="font-medium text-sm">{day}</p>
                    <p className="text-xs text-muted-foreground">09:00 - 17:00</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <FormModal
        open={editModal.open}
        title="Edit Staff Availability"
        description="Update working hours for this staff member"
        onClose={() => setEditModal({ open: false })}
        onSubmit={handleSaveAvailability}
        submitLabel="Update Schedule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time</label>
            <Input
              type="time"
              value={editData.start}
              onChange={(e) => setEditData({ ...editData, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time</label>
            <Input
              type="time"
              value={editData.end}
              onChange={(e) => setEditData({ ...editData, end: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <label className="text-sm">Available</label>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
