import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth-edge"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export type SessionUser = {
  id: number
  email: string
  role: Role
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null

  const payload = await verifyJwt(token)
  if (!payload || payload.id == null) return null

  const id = typeof payload.id === "number" ? payload.id : Number(payload.id)
  if (Number.isNaN(id)) return null

  return {
    id,
    email: payload.email as string,
    role: payload.role as Role,
  }
}

export async function requireSession(roles?: Role[]) {
  const session = await getSessionUser()
  if (!session) {
    return { error: "Unauthorized", status: 401 as const, session: null }
  }
  if (roles && !roles.includes(session.role)) {
    return { error: "Forbidden", status: 403 as const, session: null }
  }
  return { error: null, status: 200 as const, session }
}

export async function getUserProfile(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      gender: true,
      profileImage: true,
      createdAt: true,
    },
  })
}
