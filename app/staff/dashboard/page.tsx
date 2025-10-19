"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { mockAppointments } from "@/lib/mock-data"
import { Calendar, Users, CheckCircle } from "lucide-react"

export default function StaffDashboard() {
  const todayAppointments = mockAppointments.filter((a) => a.status === "confirmed")
  const completedToday = mockAppointments.filter((a) => a.status === "completed").length

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Clients Today",
      value: todayAppointments.length,
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Completed Today",
      value: completedToday,
      icon: CheckCircle,
      color: "text-purple-500",
    },
  ]

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
    <div className="space-y-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-2">Today's Overview</h2>
        <p className="text-muted-foreground">Your schedule and appointments for today</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Today's Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-xl font-bold mb-4">Today's Appointments</h3>

        <div className="space-y-4">
          {todayAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              className="p-4 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{appointment.serviceName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {appointment.time} - {appointment.clientName}
                  </p>
                  <p className="text-sm text-muted-foreground">{appointment.clientEmail}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {appointment.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
