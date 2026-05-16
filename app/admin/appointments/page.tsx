"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, X } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Appointment = {
  id: number
  serviceName: string
  clientName: string
  clientEmail: string
  date: string
  time: string
  status: string
  staffName: string
}

function statusClass(status: string) {
  if (status === "confirmed") return "bg-blue-100 text-blue-800"
  if (status === "completed") return "bg-green-100 text-green-800"
  return "bg-yellow-100 text-yellow-800"
}

export default function AdminAppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState("all")
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "confirm" | "cancel"; id: number }>({
    open: false,
    type: "confirm",
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

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchAppointments()
      toast({
        title: status === "confirmed" ? "Appointment Confirmed" : "Appointment Cancelled",
        description: `Appointment has been ${status === "confirmed" ? "confirmed" : "cancelled"}.`,
      })
    } catch {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" })
    }
    setConfirmModal({ open: false, type: "confirm", id: 0 })
  }

  const filteredAppointments =
    filter === "all" ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
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
      </div>

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="p-6 rounded-lg border bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
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
                </div>
              </div>
              {appointment.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600" onClick={() => setConfirmModal({ open: true, type: "confirm", id: appointment.id })}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmModal({ open: true, type: "cancel", id: appointment.id })}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
          confirmModal.type === "confirm"
            ? updateStatus(confirmModal.id, "confirmed")
            : updateStatus(confirmModal.id, "cancelled")
        }
        onCancel={() => setConfirmModal({ open: false, type: "confirm", id: 0 })}
      />
    </motion.div>
  )
}
