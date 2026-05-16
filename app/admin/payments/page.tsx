"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, RotateCcw } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Payment = {
  id: number
  appointmentId: number
  amount: number
  status: string
  date: string
  method: string
  clientName?: string
  serviceName?: string
}

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "paid" | "refund"; id: number }>({
    open: false,
    type: "paid",
    id: 0,
  })

  const fetchPayments = () => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data.data ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const updatePayment = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error("Failed")
      fetchPayments()
      toast({ title: "Payment Updated", description: `Payment marked as ${status}.` })
    } catch {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" })
    }
    setConfirmModal({ open: false, type: "paid", id: 0 })
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h2 className="text-3xl font-bold mb-2">Payments</h2>
        <p className="text-muted-foreground">Total paid revenue: ${totalRevenue.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="p-6 rounded-lg border bg-card flex justify-between items-center">
            <div>
              <p className="font-semibold">${payment.amount} — {payment.serviceName || `Appointment #${payment.appointmentId}`}</p>
              <p className="text-sm text-muted-foreground">
                {payment.clientName} · {payment.date} · {payment.method}
              </p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize bg-muted">
                {payment.status}
              </span>
            </div>
            <div className="flex gap-2">
              {payment.status === "pending" && (
                <Button size="sm" onClick={() => setConfirmModal({ open: true, type: "paid", id: payment.id })}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Paid
                </Button>
              )}
              {payment.status === "paid" && (
                <Button size="sm" variant="outline" onClick={() => setConfirmModal({ open: true, type: "refund", id: payment.id })}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Refund
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.type === "paid" ? "Mark as Paid?" : "Process Refund?"}
        description={confirmModal.type === "paid" ? "Mark this payment as paid?" : "Refund this payment?"}
        actionLabel={confirmModal.type === "paid" ? "Mark Paid" : "Refund"}
        isDestructive={confirmModal.type === "refund"}
        onConfirm={() => updatePayment(confirmModal.id, confirmModal.type === "paid" ? "paid" : "refunded")}
        onCancel={() => setConfirmModal({ open: false, type: "paid", id: 0 })}
      />
    </motion.div>
  )
}
