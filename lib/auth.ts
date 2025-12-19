import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const business = await prisma.business.findUnique({
          where: { email },
        });

        if (!business) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          business.passwordHash
        );

        if (!passwordsMatch) {
          return null;
        }

        // Check if email is verified
        if (!business.emailVerified) {
          throw new Error("Please verify your email address before logging in. Check your inbox for the verification link.");
        }

        return {
          id: business.id,
          email: business.email,
          name: business.name,
          paymentStatus: business.paymentStatus,
        };
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.paymentStatus = user.paymentStatus;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.paymentStatus = token.paymentStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
