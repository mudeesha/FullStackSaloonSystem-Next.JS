"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { mockAppointments, mockPayments, mockUsers } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const totalRevenue = mockPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalAppointments = mockAppointments.length
  const totalUsers = mockUsers.length

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Total Appointments",
      value: totalAppointments,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Conversion Rate",
      value: "85%",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ]

  const chartData = [
    { name: "Mon", appointments: 4, revenue: 240 },
    { name: "Tue", appointments: 3, revenue: 180 },
    { name: "Wed", appointments: 5, revenue: 300 },
    { name: "Thu", appointments: 4, revenue: 240 },
    { name: "Fri", appointments: 6, revenue: 360 },
    { name: "Sat", appointments: 3, revenue: 180 },
    { name: "Sun", appointments: 0, revenue: 0 },
  ]

  const statusData = [
    { name: "Confirmed", value: 8, fill: "#3b82f6" },
    { name: "Completed", value: 5, fill: "#10b981" },
    { name: "Pending", value: 2, fill: "#f59e0b" },
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
        <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Key metrics and analytics</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Bar Chart */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-semibold mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#3b82f6" />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Appointment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  )
}
