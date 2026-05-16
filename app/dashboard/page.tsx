"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

type Appointment = {
  id: number
  serviceName: string
  date: string
  time: string
  status: string
  staffName: string
  amount?: number
}

export default function CustomerDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.data ?? []))
      .catch(console.error)
  }, [])

  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .slice(0, 3)
  const completedAppointments = appointments.filter((a) => a.status === "completed").length
  const totalSpent = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.amount ?? 0), 0)

  const stats = [
    {
      label: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Completed Services",
      value: completedAppointments,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toFixed(0)}`,
      icon: Clock,
      color: "text-purple-500",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Manage your appointments and profile</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <motion.div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </motion.div>
            </Card>
          )
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/appointments">View All</Link>
          </Button>
        </div>

        {upcomingAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No upcoming appointments</p>
            <Button className="bg-primary hover:bg-[#B2223A] text-white" asChild>
              <Link href="/book">Book Now</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{appointment.serviceName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment.date} at {appointment.time}
                    </p>
                    <p className="text-sm text-muted-foreground">with {appointment.staffName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                    {appointment.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
