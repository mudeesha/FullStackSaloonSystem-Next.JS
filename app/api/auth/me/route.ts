import { NextResponse } from "next/server"
import { getSessionUser, getUserProfile } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserProfile(session.id)
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
