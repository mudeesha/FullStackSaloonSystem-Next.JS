"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { mockAppointments } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, X } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

export default function AdminAppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [filter, setFilter] = useState("all")
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "confirm" | "cancel"; id: number }>({
    open: false,
    type: "confirm",
    id: 0,
  })

  const handleConfirm = (id: number) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "confirmed" as const } : a)))
    toast({
      title: "Appointment Confirmed",
      description: "Appointment has been confirmed.",
    })
    setConfirmModal({ open: false, type: "confirm", id: 0 })
  }

  const handleCancel = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id))
    toast({
      title: "Appointment Cancelled",
      description: "Appointment has been cancelled.",
    })
    setConfirmModal({ open: false, type: "cancel", id: 0 })
  }

  const filteredAppointments = filter === "all" ? appointments : appointments.filter((a) => a.status === filter)

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
        <h2 className="text-3xl font-bold mb-6">Appointments</h2>

        <div className="flex gap-2 mb-6">
          {["all", "confirmed", "completed", "pending"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {filteredAppointments.map((appointment, index) => (
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Date & Time</p>
                    <p>
                      {appointment.date} {appointment.time}
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
                    <p className="font-medium text-foreground">Staff</p>
                    <p>{appointment.staffName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
              </div>
              {appointment.status === "pending" && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => setConfirmModal({ open: true, type: "confirm", id: appointment.id })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
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
        title={confirmModal.type === "confirm" ? "Confirm Appointment?" : "Cancel Appointment?"}
        description={
          confirmModal.type === "confirm"
            ? "Are you sure you want to confirm this appointment?"
            : "Are you sure you want to cancel this appointment?"
        }
        actionLabel={confirmModal.type === "confirm" ? "Confirm" : "Cancel"}
        isDestructive={confirmModal.type === "cancel"}
        onConfirm={() =>
          confirmModal.type === "confirm" ? handleConfirm(confirmModal.id) : handleCancel(confirmModal.id)
        }
        onCancel={() => setConfirmModal({ open: false, type: "confirm", id: 0 })}
      />
    </div>
  )
}
