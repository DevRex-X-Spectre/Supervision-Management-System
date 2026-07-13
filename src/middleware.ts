import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;
  const status = req.auth?.user?.status;

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
});

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
