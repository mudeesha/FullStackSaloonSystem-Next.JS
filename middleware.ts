import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "./lib/auth-edge";

// export const runtime = "nodejs";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip public pages
  const publicPaths = ["/login", "/register", "/favicon.ico", "/_next/"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    console.log("No token found → redirect /login");
    return NextResponse.redirect(new URL("/login1", req.url));
  }

  const payload = verifyJwt(token);

  if (!payload) {
    console.log("Invalid token → redirect /login");
    return NextResponse.redirect(new URL("/login2", req.url));
  }

  // const role = (payload as any).role;

  // if (pathname.startsWith("/admin") && role !== "ADMIN") {
  //   return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  // }

  // if (pathname.startsWith("/staff") && role !== "STAFF") {
  //   return NextResponse.redirect(new URL("/staff/dashboard", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/staff/:path*"],
};