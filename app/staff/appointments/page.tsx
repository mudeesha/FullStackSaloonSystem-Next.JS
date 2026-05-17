"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, X } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { SearchBar } from "@/components/search-bar"
import { matchesListSearch } from "@/lib/list-search"

type Appointment = {
  id: number
  serviceName: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  date: string
  time: string
  status: string
}

export default function StaffAppointmentsPage() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "complete" | "cancel"; id: number }>({
    open: false,
    type: "complete",
    id: 0,
  })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/appointments?staff=true", { credentials: "include" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setAppointments(data.data ?? [])
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load appointments",
        variant: "destructive",
      })
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      fetchAppointments()
      toast({
        title: status === "completed" ? "Appointment Completed" : "Appointment Cancelled",
        description: `Appointment marked as ${status}.`,
      })
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update appointment.",
        variant: "destructive",
      })
    }
    setConfirmModal({ open: false, type: "complete", id: 0 })
  }

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((a) =>
        matchesListSearch(search, [
          a.id,
          a.serviceName,
          a.clientName,
          a.clientEmail,
          a.clientPhone,
          a.status,
          a.date,
          a.time,
        ]),
      ),
    [appointments, search],
  )

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold">Appointments</h2>
          <p className="text-muted-foreground">Manage appointments assigned to you</p>
        </div>
        <SearchBar
          onSearch={setSearch}
          placeholder="Search by ID, client, service, status..."
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading appointments...</p>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {search ? "No appointments match your search." : "No appointments assigned to you yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment.id}
              className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-4">
                    <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
                      #{appointment.id}
                    </span>
                    <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        appointment.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-4">
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
                      <p>{appointment.clientPhone || "—"}</p>
                    </div>
                  </div>
                </div>
                {(appointment.status === "confirmed" || appointment.status === "pending") && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setConfirmModal({ open: true, type: "complete", id: appointment.id })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmModal({ open: true, type: "cancel", id: appointment.id })}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
          confirmModal.type === "complete"
            ? updateStatus(confirmModal.id, "completed")
            : updateStatus(confirmModal.id, "cancelled")
        }
        onCancel={() => setConfirmModal({ open: false, type: "complete", id: 0 })}
      />
    </motion.div>
  )
}
