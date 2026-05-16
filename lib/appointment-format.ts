import type { Appointment, AppointmentService, Payment, Review, Service, User } from "@prisma/client"

type AppointmentWithRelations = Appointment & {
  customer: Pick<User, "id" | "name" | "email" | "phone">
  staff: Pick<User, "id" | "name" | "email" | "phone">
  services: (AppointmentService & { service: Service })[]
  payment?: Payment | null
  review?: Review | null
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function statusToUi(status: string): string {
  return status.toLowerCase()
}

export function formatAppointmentForUi(appointment: AppointmentWithRelations) {
  const primaryService = appointment.services[0]
  const serviceNames = appointment.services.map((s) => s.service.name).join(", ")

  return {
    id: appointment.id,
    serviceId: primaryService?.serviceId ?? 0,
    serviceName: serviceNames || "Service",
    clientName: appointment.customer.name,
    clientEmail: appointment.customer.email,
    clientPhone: appointment.customer.phone ?? "",
    date: formatDate(appointment.appointmentDate),
    time: formatTime(appointment.startTime),
    status: statusToUi(appointment.status),
    staffName: appointment.staff.name,
    staffId: appointment.staffId,
    customerId: appointment.customerId,
    notes: appointment.notes,
    amount: appointment.services.reduce((sum, s) => sum + s.price, 0),
    paymentStatus: appointment.payment?.status?.toLowerCase() ?? null,
    review: appointment.review
      ? {
          id: appointment.review.id,
          rating: appointment.review.rating,
          comment: appointment.review.comment,
        }
      : null,
  }
}
