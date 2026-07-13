import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });
  const isLoggedIn = !!token;
  const role = typeof token?.role === "string" ? token.role : undefined;
  const status = typeof token?.status === "string" ? token.status : undefined;

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/api/inngest");

  if (isLoggedIn && status && status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/login?error=inactive", req.url));
  }

  if (!isLoggedIn && !isPublic && !pathname.startsWith("/api/")) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (isLoggedIn && pathname === "/register") {
    const home =
      role === "STUDENT"
        ? "/student"
        : role === "SUPERVISOR"
          ? "/supervisor"
          : "/coordinator";
    return NextResponse.redirect(new URL(home, req.url));
  }

  if (isLoggedIn && role) {
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    if (pathname.startsWith("/supervisor") && role !== "SUPERVISOR") {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
    if (pathname.startsWith("/coordinator") && role !== "COORDINATOR") {
      return NextResponse.redirect(new URL(roleHome(role), req.url));
    }
  }

  return NextResponse.next();
}

function roleHome(role: string) {
  if (role === "STUDENT") return "/student";
  if (role === "SUPERVISOR") return "/supervisor";
  return "/coordinator";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
