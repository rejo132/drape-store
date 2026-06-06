import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: {
            where: { provider: "credentials" },
            take: 1,
          },
        },
      });

      const account = user?.accounts[0];
      if (!user || !account?.access_token) {
        return null;
      }

      const passwordValid = await bcrypt.compare(password, account.access_token);
      if (!passwordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async signIn({ user }) {
      if (!user.id) {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          stripeCustomerId: true,
        },
      });

      if (dbUser && !dbUser.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
        const customer = await getStripeServer().customers.create({
          email: dbUser.email,
          name: dbUser.name ?? undefined,
          metadata: { userId: dbUser.id },
        });

        await prisma.user.update({
          where: { id: dbUser.id },
          data: { stripeCustomerId: customer.id },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
});
