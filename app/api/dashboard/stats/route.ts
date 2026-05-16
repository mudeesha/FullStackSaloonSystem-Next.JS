import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"

export async function GET() {
  try {
    const auth = await requireSession(["ADMIN"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const [payments, appointments, users, statusGroups] = await Promise.all([
      prisma.payment.findMany({ where: { status: "PAID" } }),
      prisma.appointment.findMany({
        include: { services: true },
        orderBy: { appointmentDate: "desc" },
        take: 100,
      }),
      prisma.user.count(),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ])

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalAppointments = await prisma.appointment.count()

    const statusData = statusGroups.map((g) => ({
      name: g.status.charAt(0) + g.status.slice(1).toLowerCase(),
      value: g._count.status,
      fill:
        g.status === "CONFIRMED"
          ? "#3b82f6"
          : g.status === "COMPLETED"
            ? "#10b981"
            : g.status === "PENDING"
              ? "#f59e0b"
              : "#ef4444",
    }))

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d
    })

    const chartData = last7Days.map((day) => {
      const dayStr = day.toISOString().split("T")[0]
      const dayAppointments = appointments.filter(
        (a) => a.appointmentDate.toISOString().split("T")[0] === dayStr,
      )
      const revenue = dayAppointments.reduce(
        (sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0),
        0,
      )
      return {
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        appointments: dayAppointments.length,
        revenue,
      }
    })

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalAppointments,
        totalUsers: users,
        conversionRate: totalAppointments > 0 ? "85%" : "0%",
      },
      chartData,
      statusData,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
