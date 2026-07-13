import NextAuth from "next-auth";
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      status: string;
      department?: string | null;
      title?: string | null;
      avatarUrl?: string | null;
      assignedSupervisorId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: string;
    department?: string | null;
    title?: string | null;
    avatarUrl?: string | null;
    assignedSupervisorId?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: string;
    department?: string | null;
    title?: string | null;
    avatarUrl?: string | null;
    assignedSupervisorId?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          department: user.department,
          title: user.title,
          avatarUrl: user.avatarUrl,
          assignedSupervisorId: user.assignedSupervisorId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.status = user.status;
        token.department = user.department;
        token.title = user.title;
        token.avatarUrl = user.avatarUrl;
        token.assignedSupervisorId = user.assignedSupervisorId;
      }

      // Keep JWT self-contained so middleware can run on the Edge runtime.
      // Fresh profile fields are loaded at sign-in and on explicit session update.
      if (trigger === "update" && session?.user) {
        token.firstName = session.user.firstName ?? token.firstName;
        token.lastName = session.user.lastName ?? token.lastName;
        token.department = session.user.department ?? token.department;
        token.title = session.user.title ?? token.title;
        token.avatarUrl = session.user.avatarUrl ?? token.avatarUrl;
        token.assignedSupervisorId =
          session.user.assignedSupervisorId ?? token.assignedSupervisorId;
        token.status = session.user.status ?? token.status;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
        status: token.status,
        department: token.department,
        title: token.title,
        avatarUrl: token.avatarUrl,
        assignedSupervisorId: token.assignedSupervisorId,
        emailVerified: null,
      };
      return session;
    },
  },
  trustHost: true,
});
