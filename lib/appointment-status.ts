import type { AppointmentStatus, Role } from "@prisma/client"

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
}

const STAFF_ALLOWED: AppointmentStatus[] = ["COMPLETED", "CANCELLED"]
const CUSTOMER_ALLOWED: AppointmentStatus[] = ["CANCELLED"]
const ADMIN_ALLOWED: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]

export function canTransition(
  current: AppointmentStatus,
  next: AppointmentStatus,
  role: Role,
): { ok: true } | { ok: false; error: string } {
  if (current === next) {
    return { ok: true }
  }

  if (!TRANSITIONS[current].includes(next)) {
    return { ok: false, error: `Cannot change status from ${current} to ${next}` }
  }

  if (role === "CUSTOMER") {
    if (!CUSTOMER_ALLOWED.includes(next)) {
      return { ok: false, error: "Customers can only cancel appointments" }
    }
  }

  if (role === "STAFF") {
    if (!STAFF_ALLOWED.includes(next)) {
      return { ok: false, error: "Staff can only mark appointments completed or cancelled" }
    }
  }

  if (role === "ADMIN" && !ADMIN_ALLOWED.includes(next)) {
    return { ok: false, error: "Invalid status" }
  }

  return { ok: true }
}
