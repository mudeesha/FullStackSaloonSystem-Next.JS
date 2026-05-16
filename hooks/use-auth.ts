"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: "CUSTOMER" | "STAFF" | "ADMIN"
  phone?: string | null
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      const data = await res.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    router.push("/login")
    router.refresh()
  }

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "STAFF"
        ? "/staff/dashboard"
        : "/dashboard"

  const profilePath =
    user?.role === "STAFF" ? "/staff/profile" : user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard/profile"

  return { user, loading, logout, refresh, dashboardPath, profilePath, isLoggedIn: !!user }
}
