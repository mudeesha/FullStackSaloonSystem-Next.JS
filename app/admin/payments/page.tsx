"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockPayments } from "@/lib/mock-data"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, RotateCcw, Plus } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { FormModal } from "@/components/form-modal"

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState(mockPayments)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: "paid" | "refund"; id: number }>({
    open: false,
    type: "paid",
    id: 0,
  })
  const [formModal, setFormModal] = useState({ open: false })
  const [formData, setFormData] = useState({ appointmentId: "", amount: "", method: "credit_card" })

  const handleMarkPaid = (id: number) => {
    setPayments(payments.map((p) => (p.id === id ? { ...p, status: "paid" as const } : p)))
    toast({
      title: "Payment Marked",
      description: "Payment has been marked as paid.",
    })
    setConfirmModal({ open: false, type: "paid", id: 0 })
  }

  const handleRefund = (id: number) => {
    setPayments(payments.filter((p) => p.id !== id))
    toast({
      title: "Refund Processed",
      description: "Refund has been processed.",
    })
    setConfirmModal({ open: false, type: "refund", id: 0 })
  }

  const handleAddPayment = () => {
    const newPayment = {
      id: Math.max(...payments.map((p) => p.id), 0) + 1,
      appointmentId: Number.parseInt(formData.appointmentId),
      amount: Number.parseFloat(formData.amount),
      date: new Date().toLocaleDateString(),
      method: formData.method,
      status: "pending" as const,
    }
    setPayments([...payments, newPayment])
    toast({
      title: "Payment Added",
      description: "New payment record has been added.",
    })
    setFormModal({ open: false })
    setFormData({ appointmentId: "", amount: "", method: "credit_card" })
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

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Payments</h2>
            <p className="text-muted-foreground">Total Revenue: ${totalRevenue}</p>
          </div>
          <Button onClick={() => setFormModal({ open: true })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-lg font-semibold">Appointment #{payment.appointmentId}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Amount</p>
                    <p>${payment.amount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p>{payment.date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Method</p>
                    <p>{payment.method}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Status</p>
                    <p className="capitalize">{payment.status}</p>
                  </div>
                </div>
              </div>
              {payment.status === "pending" && (
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => setConfirmModal({ open: true, type: "paid", id: payment.id })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmModal({ open: true, type: "refund", id: payment.id })}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Refund
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.type === "paid" ? "Mark Payment as Paid?" : "Process Refund?"}
        description={
          confirmModal.type === "paid"
            ? "Are you sure you want to mark this payment as paid?"
            : "Are you sure you want to process this refund?"
        }
        actionLabel={confirmModal.type === "paid" ? "Mark Paid" : "Refund"}
        isDestructive={confirmModal.type === "refund"}
        onConfirm={() =>
          confirmModal.type === "paid" ? handleMarkPaid(confirmModal.id) : handleRefund(confirmModal.id)
        }
        onCancel={() => setConfirmModal({ open: false, type: "paid", id: 0 })}
      />

      <FormModal
        open={formModal.open}
        title="Add New Payment"
        description="Record a new payment for an appointment"
        onClose={() => setFormModal({ open: false })}
        onSubmit={handleAddPayment}
        submitLabel="Add Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Appointment ID</label>
            <Input
              type="number"
              value={formData.appointmentId}
              onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amount ($)</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
