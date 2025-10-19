"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { mockAppointments } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, X } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

export default function StaffAppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "complete" | "cancel"; id: number }>({
    open: false,
    type: "complete",
    id: 0,
  })

  const handleComplete = (id: number) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "completed" as const } : a)))
    toast({
      title: "Appointment Completed",
      description: "Appointment marked as completed.",
    })
    setConfirmModal({ open: false, type: "complete", id: 0 })
  }

  const handleCancel = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id))
    toast({
      title: "Appointment Cancelled",
      description: "Appointment has been cancelled.",
    })
    setConfirmModal({ open: false, type: "cancel", id: 0 })
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
        <h2 className="text-3xl font-bold mb-2">Appointments</h2>
        <p className="text-muted-foreground">Manage your appointments</p>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      appointment.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Date & Time</p>
                    <p>
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Client</p>
                    <p>{appointment.clientName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p>{appointment.clientEmail}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
              </div>
              {appointment.status === "confirmed" && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => setConfirmModal({ open: true, type: "complete", id: appointment.id })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmModal({ open: true, type: "cancel", id: appointment.id })}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.type === "complete" ? "Complete Appointment?" : "Cancel Appointment?"}
        description={
          confirmModal.type === "complete"
            ? "Mark this appointment as completed?"
            : "Are you sure you want to cancel this appointment?"
        }
        actionLabel={confirmModal.type === "complete" ? "Complete" : "Cancel"}
        isDestructive={confirmModal.type === "cancel"}
        onConfirm={() =>
          confirmModal.type === "complete" ? handleComplete(confirmModal.id) : handleCancel(confirmModal.id)
        }
        onCancel={() => setConfirmModal({ open: false, type: "complete", id: 0 })}
      />
    </div>
  )
}
