// app/api/auth/login/route.ts
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { signJwt } from "@/lib/auth-node";
import { cookies } from "next/headers";

// Define the role types
type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

// Role-based redirect paths with type safety
const ROLE_REDIRECTS: Record<UserRole, string> = {
  CUSTOMER: "/dashboard",
  ADMIN: "/admin/dashboard", 
  STAFF: "/staff/dashboard"
} as const;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.password))) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    // ✅ Set cookie with await
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // Get redirect path based on role
    const userRole = user.role as UserRole;
    const redirectTo = ROLE_REDIRECTS[userRole] || "/dashboard";

    return Response.json({
      success: true,
      message: "Login successful",
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone 
      },
      redirectTo,
    });
  } catch (e) {
    console.error("Login error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}