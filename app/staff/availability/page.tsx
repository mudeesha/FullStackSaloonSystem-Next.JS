"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { ConfirmationModal } from "@/components/confirmation-modal"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AvailabilityPage() {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState(
    days.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { start: "09:00", end: "17:00", available: true },
      }),
      {},
    ),
  )
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (day: string, field: string, value: string | boolean) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value },
    })
  }

  const handleSave = () => {
    setShowConfirm(true)
  }

  const confirmSave = () => {
    toast({
      title: "Schedule Updated",
      description: "Your availability has been updated successfully.",
    })
    setShowConfirm(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
        <h2 className="text-3xl font-bold mb-2">My Availability</h2>
        <p className="text-muted-foreground">Set your working hours</p>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {days.map((day, index) => (
          <motion.div key={day} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="w-24">
                  <p className="font-semibold">{day}</p>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <label className="text-sm text-muted-foreground">Start</label>
                    <Input
                      type="time"
                      value={schedule[day]?.start || "09:00"}
                      onChange={(e) => handleChange(day, "start", e.target.value)}
                      className="w-24"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">End</label>
                    <Input
                      type="time"
                      value={schedule[day]?.end || "17:00"}
                      onChange={(e) => handleChange(day, "end", e.target.value)}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule[day]?.available || false}
                      onChange={(e) => handleChange(day, "available", e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <label className="text-sm">Available</label>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Button onClick={handleSave} className="w-full">
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
