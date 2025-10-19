"use client"

import { motion } from "framer-motion"
import { mockAppointments } from "@/lib/mock-data"
import { Star } from "lucide-react"

export default function HistoryPage() {
  const completedAppointments = mockAppointments.filter((a) => a.status === "completed")

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
        <h2 className="text-3xl font-bold mb-2">Booking History</h2>
        <p className="text-muted-foreground">View your past appointments</p>
      </motion.div>

      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {completedAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No completed appointments yet</p>
          </div>
        ) : (
          completedAppointments.map((appointment, index) => (
            <motion.div key={appointment.id} className="p-6 rounded-lg border bg-card" variants={itemVariants}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.serviceName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                  Completed
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Staff: {appointment.staffName}</span>
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
