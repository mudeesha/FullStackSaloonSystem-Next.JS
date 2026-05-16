"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Calendar, CheckCircle, Clock } from "lucide-react"

type Appointment = {
  id: number
  serviceName: string
  clientName: string
  date: string
  time: string
  status: string
}

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetch("/api/appointments?today=true")
      .then((res) => res.json())
      .then((data) => setAppointments(data.data ?? []))
      .catch(console.error)
  }, [])

  const todayAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending",
  )
  const completedToday = appointments.filter((a) => a.status === "completed").length

  const stats = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: Calendar, color: "text-blue-500" },
    { label: "Completed Today", value: completedToday, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending", value: appointments.filter((a) => a.status === "pending").length, icon: Clock, color: "text-orange-500" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-muted-foreground">Overview of your day</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4">Today&apos;s Appointments</h2>
        <div className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No appointments scheduled for today.</Card>
          ) : (
            todayAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{appointment.serviceName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment.date} at {appointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">Client: {appointment.clientName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                    {appointment.status}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
