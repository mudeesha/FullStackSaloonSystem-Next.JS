import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./lib/auth-edge";

// export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip public pages
  const publicPaths = ["/login", "/register", "/favicon.ico", "/_next/"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = payload.role as string;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff/dashboard", req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/staff") && role !== "STAFF" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/dashboard") && role !== "CUSTOMER") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/staff/:path*"],
};