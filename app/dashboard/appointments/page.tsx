"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { mockAppointments } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Edit } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "delete" | "edit"; id: number }>({
    open: false,
    type: "delete",
    id: 0,
  })

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id))
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled successfully.",
    })
    setConfirmModal({ open: false, type: "delete", id: 0 })
  }

  const handleEdit = (id: number) => {
    toast({
      title: "Edit Feature",
      description: "Edit functionality would be implemented here.",
    })
    setConfirmModal({ open: false, type: "edit", id: 0 })
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">My Appointments</h2>
            <p className="text-muted-foreground">Manage your salon appointments</p>
          </div>
          <Button asChild>
            <Link href="/book">Book New Appointment</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No appointments found</p>
            <Button asChild>
              <Link href="/book">Book Your First Appointment</Link>
            </Button>
          </div>
        ) : (
          appointments.map((appointment, index) => (
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
                      <p className="font-medium text-foreground">Date</p>
                      <p>{appointment.date}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Time</p>
                      <p>{appointment.time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Staff</p>
                      <p>{appointment.staffName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Client</p>
                      <p>{appointment.clientName}</p>
                    </div>
                  </div>
                </div>
                {appointment.status === "confirmed" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmModal({ open: true, type: "edit", id: appointment.id })}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmModal({ open: true, type: "delete", id: appointment.id })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.type === "delete" ? "Cancel Appointment?" : "Edit Appointment?"}
        description={
          confirmModal.type === "delete"
            ? "Are you sure you want to cancel this appointment?"
            : "Would you like to edit this appointment?"
        }
        actionLabel={confirmModal.type === "delete" ? "Cancel" : "Edit"}
        isDestructive={confirmModal.type === "delete"}
        onConfirm={() => (confirmModal.type === "delete" ? handleDelete(confirmModal.id) : handleEdit(confirmModal.id))}
        onCancel={() => setConfirmModal({ open: false, type: "delete", id: 0 })}
      />
    </div>
  )
}
