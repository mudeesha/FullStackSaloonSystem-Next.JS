// app/api/public/availability/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Map numeric day to enum values
const dayOfWeekMap = {
  0: 'SUNDAY',
  1: 'MONDAY', 
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY'
} as const

// Helper function to check if time is within availability range
function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  const [timeHours, timeMinutes] = time.split(':').map(Number)
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const timeValue = timeHours * 60 + timeMinutes
  const startValue = startHours * 60 + startMinutes
  const endValue = endHours * 60 + endMinutes
  
  return timeValue >= startValue && timeValue <= endValue
}

// Helper function to check if appointment fits within working hours including duration
function canAccommodateAppointment(
  time: string, 
  durationMinutes: number, 
  startTime: string, 
  endTime: string
): boolean {
  const [timeHours, timeMinutes] = time.split(':').map(Number)
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const appointmentStart = timeHours * 60 + timeMinutes
  const appointmentEnd = appointmentStart + durationMinutes
  const workingStart = startHours * 60 + startMinutes
  const workingEnd = endHours * 60 + endMinutes
  
  return appointmentStart >= workingStart && appointmentEnd <= workingEnd
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const serviceId = searchParams.get('serviceId')

    if (!date || !time || !serviceId) {
      return NextResponse.json(
        { error: "Date, time, and service ID are required" },
        { status: 400 }
      )
    }

    // Get staff assigned to this service
    const serviceStaff = await prisma.staffService.findMany({
      where: { serviceId: parseInt(serviceId) },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    })

    const staffIds = serviceStaff.map(s => s.staffId)

    if (staffIds.length === 0) {
      return NextResponse.json({
        availableStaff: [],
        availability: [],
        message: "No staff assigned to this service"
      })
    }

    // Get staff availability for the selected day
    const selectedDate = new Date(date)
    const numericDayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayOfWeek = dayOfWeekMap[numericDayOfWeek as keyof typeof dayOfWeekMap]

    const availability = await prisma.staffAvailability.findMany({
      where: {
        staffId: { in: staffIds },
        dayOfWeek: dayOfWeek,
        isActive: true
      }
    })

    // Check for existing appointments
    const appointmentStart = new Date(`${date}T${time}`)
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const appointmentEnd = new Date(appointmentStart.getTime() + service.durationMinutes * 60000)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId: { in: staffIds },
        appointmentDate: new Date(date),
        OR: [
          {
            startTime: { lt: appointmentEnd },
            endTime: { gt: appointmentStart }
          }
        ]
      }
    })

    const busyStaffIds = existingAppointments.map(a => a.staffId)

    // Filter staff who are available based on:
    // 1. Not busy with existing appointments
    // 2. Selected time falls within working hours
    // 3. Entire appointment duration fits within working hours
    const availableStaff = serviceStaff.filter(s => {
      const isNotBusy = !busyStaffIds.includes(s.staffId)
      const staffAvailability = availability.filter(a => a.staffId === s.staffId)
      
      // Check if selected time and duration fit within any of the staff's availability slots
      const canAccommodate = staffAvailability.some(avail => 
        canAccommodateAppointment(time, service.durationMinutes, avail.startTime, avail.endTime)
      )
      
      return isNotBusy && canAccommodate
    }).map(s => s.staff)

    return NextResponse.json({
      availableStaff,
      availability,
      debug: {
        selectedTime: time,
        serviceDuration: service.durationMinutes,
        staffAvailability: availability.map(a => ({
          staffId: a.staffId,
          day: a.dayOfWeek,
          hours: `${a.startTime} - ${a.endTime}`
        }))
      }
    })
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    )
  }
}