import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { signJwt } from "@/lib/auth-node";
import { cookies } from "next/headers";

type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF';

const ROLE_REDIRECTS: Record<UserRole, string> = {
  CUSTOMER: "/dashboard",
  ADMIN: "/admin/dashboard", 
  STAFF: "/staff/dashboard"
} as const;

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashed, 
        phone: phone || null,
        role: "CUSTOMER" 
      },
    });

    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    const userRole = user.role as UserRole;

    const redirectTo = ROLE_REDIRECTS[userRole] || "/dashboard";

    return Response.json({
      success: true,
      message: "Registered successfully",
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
    console.error("Register error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}