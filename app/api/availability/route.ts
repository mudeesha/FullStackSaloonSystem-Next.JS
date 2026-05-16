import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/session"
import type { DayOfWeek } from "@prisma/client"

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
}

const LABEL_TO_DAY: Record<string, DayOfWeek> = Object.fromEntries(
  Object.entries(DAY_LABELS).map(([k, v]) => [v, k as DayOfWeek]),
) as Record<string, DayOfWeek>

export async function GET(request: Request) {
  try {
    const auth = await requireSession(["ADMIN", "STAFF"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const staffIdParam = searchParams.get("staffId")
    const allStaff = searchParams.get("allStaff") === "true"

    if (allStaff && auth.session.role === "ADMIN") {
      const staff = await prisma.user.findMany({
        where: { role: "STAFF" },
        select: {
          id: true,
          name: true,
          email: true,
          availabilities: true,
        },
        orderBy: { name: "asc" },
      })

      const data = staff.map((member) => {
        const schedule: Record<string, { start: string; end: string; available: boolean }> = {}
        for (const day of Object.values(DAY_LABELS)) {
          schedule[day] = { start: "09:00", end: "17:00", available: false }
        }
        for (const slot of member.availabilities) {
          const label = DAY_LABELS[slot.dayOfWeek]
          schedule[label] = {
            start: slot.startTime,
            end: slot.endTime,
            available: slot.isActive,
          }
        }
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          schedule,
        }
      })

      return NextResponse.json({ data })
    }

    let staffId = auth.session.id
    if (staffIdParam && auth.session.role === "ADMIN") {
      staffId = Number(staffIdParam)
    }

    const availability = await prisma.staffAvailability.findMany({
      where: { staffId },
      orderBy: { dayOfWeek: "asc" },
    })

    const schedule: Record<string, { start: string; end: string; available: boolean }> = {}
    for (const day of Object.values(DAY_LABELS)) {
      schedule[day] = { start: "09:00", end: "17:00", available: false }
    }

    for (const slot of availability) {
      const label = DAY_LABELS[slot.dayOfWeek]
      schedule[label] = {
        start: slot.startTime,
        end: slot.endTime,
        available: slot.isActive,
      }
    }

    return NextResponse.json({ staffId, schedule, raw: availability })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireSession(["ADMIN", "STAFF"])
    if (!auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { schedule, staffId: bodyStaffId } = body as {
      schedule: Record<string, { start: string; end: string; available: boolean }>
      staffId?: number
    }

    let staffId = auth.session.id
    if (bodyStaffId && auth.session.role === "ADMIN") {
      staffId = bodyStaffId
    }

    if (!schedule) {
      return NextResponse.json({ error: "Schedule is required" }, { status: 400 })
    }

    await prisma.staffAvailability.deleteMany({ where: { staffId } })

    const creates = Object.entries(schedule)
      .filter(([, value]) => value.available)
      .map(([dayLabel, value]) => ({
        staffId,
        dayOfWeek: LABEL_TO_DAY[dayLabel],
        startTime: value.start,
        endTime: value.end,
        isActive: true,
      }))
      .filter((row) => row.dayOfWeek)

    if (creates.length > 0) {
      await prisma.staffAvailability.createMany({ data: creates })
    }

    return NextResponse.json({ message: "Availability updated" })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
