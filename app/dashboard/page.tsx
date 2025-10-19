"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"

export default function CustomerDashboard() {
  const upcomingAppointments = mockAppointments.filter((a) => a.status === "confirmed").slice(0, 3)
  const completedAppointments = mockAppointments.filter((a) => a.status === "completed").length

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
      value: "$450",
      icon: Clock,
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
        <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-muted-foreground">Here's your appointment overview</p>
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

      {/* Upcoming Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Upcoming Appointments</h3>
          <Button asChild>
            <Link href="/book">Book New</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {upcomingAppointments.map((appointment, index) => (
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
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-muted-foreground">with {appointment.staffName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {appointment.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
          <Link href="/dashboard/appointments">View All Appointments</Link>
        </Button>
      </motion.div>
    </div>
  )
}
