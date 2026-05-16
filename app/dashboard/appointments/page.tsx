"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { X, Edit } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Appointment = {
  id: number
  serviceName: string
  date: string
  time: string
  status: string
  staffName: string
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "delete" | "edit"; id: number }>({
    open: false,
    type: "delete",
    id: 0,
  })

  const fetchAppointments = () => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.data ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchAppointments()
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      })
    } catch {
      toast({ title: "Error", description: "Failed to cancel appointment.", variant: "destructive" })
    }
    setConfirmModal({ open: false, type: "delete", id: 0 })
  }

  const handleEdit = () => {
    toast({ title: "Edit Feature", description: "Edit functionality would be implemented here." })
    setConfirmModal({ open: false, type: "edit", id: 0 })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">My Appointments</h2>
        <Button className="bg-primary hover:bg-[#B2223A] text-white" asChild>
          <Link href="/book">Book New</Link>
        </Button>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants}>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No appointments found.</p>
        ) : (
          appointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-muted-foreground">with {appointment.staffName}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                    {appointment.status}
                  </span>
                </div>
                {(appointment.status === "pending" || appointment.status === "confirmed") && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setConfirmModal({ open: true, type: "edit", id: appointment.id })}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmModal({ open: true, type: "delete", id: appointment.id })}
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
        actionLabel={confirmModal.type === "delete" ? "Cancel Appointment" : "Edit"}
        isDestructive={confirmModal.type === "delete"}
        onConfirm={() => (confirmModal.type === "delete" ? handleDelete(confirmModal.id) : handleEdit())}
        onCancel={() => setConfirmModal({ open: false, type: "delete", id: 0 })}
      />
    </motion.div>
  )
}
