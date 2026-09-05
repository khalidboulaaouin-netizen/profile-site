import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "follower";
    };
  }

  interface User {
    role?: "admin" | "follower";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "follower";
  }
}

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

async function verifyAdminPassword(password: string): Promise<boolean> {
  const plain = process.env.ADMIN_PASSWORD || "";
  if (plain && password === plain) return true;

  // Optional hash support. Escape every $ as \$ in .env if you use ADMIN_PASSWORD_HASH.
  const hash = (process.env.ADMIN_PASSWORD_HASH || "").replace(/^['"]|['"]$/g, "");
  if (hash.startsWith("$2")) {
    return bcrypt.compare(password, hash);
  }
  return false;
}

const providers = [
  Credentials({
    id: "admin-credentials",
    name: "Admin",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "")
        .trim()
        .toLowerCase();
      const password = String(credentials?.password || "");
      // Owner login is locked to this mailbox only (password comes from env).
      const adminEmail = (
        process.env.ADMIN_EMAIL || "KhalidBoulaaouin@gmail.com"
      )
        .trim()
        .toLowerCase();

      if (!email || !password || !adminEmail) return null;
      if (email !== adminEmail) return null;

      const ok = await verifyAdminPassword(password);
      if (!ok) return null;

      return {
        id: "admin",
        email: adminEmail,
        name: "المالك",
        role: "admin" as const,
      };
    },
  }),
  ...(googleConfigured
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          allowDangerousEmailAccountLinking: false,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || (account?.provider === "google" ? "follower" : "admin");
      }
      if (account?.provider === "google") {
        token.role = "follower";
        token.id = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.role = token.role === "admin" ? "admin" : "follower";
      }
      return session;
    },
  },
  trustHost: true,
});

export function isGoogleAuthConfigured() {
  return googleConfigured;
}
