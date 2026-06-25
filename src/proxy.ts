import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/profile", "/auth/:path"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  const isDashboard = pathname.startsWith("/dashboard");

  if (!isDashboard) return;

  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
