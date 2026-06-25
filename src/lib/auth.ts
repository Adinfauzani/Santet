import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Plan, UserRole } from "@/generated/prisma/client";
import { prisma } from "./db";
import { generateUsername } from "./reserved";

const sudoGithubUsername = process.env.AUTH_SUDO_GITHUB_USERNAME || "Adinfauzani";

function makeProviderConfig(provider: "github" | "google") {
  return {
    allowDangerousEmailAccountLinking: true,
  };
}

const providers: NonNullable<NextAuthConfig["providers"]> = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user?.password) return null;

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar || null,
        username: user.username,
        role: user.role,
        plan: user.plan,
      };
    },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      ...makeProviderConfig("github"),
    }),
  );
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      ...makeProviderConfig("google"),
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  );
}

function getGithubUsername(profile: unknown) {
  const profileRecord = profile as { login?: string } | undefined;
  return typeof profileRecord?.login === "string" ? profileRecord.login : "";
}

function getRoleForGithubUser(existingRole?: UserRole | null, githubUsername = "") {
  if (githubUsername.toLowerCase() === sudoGithubUsername.toLowerCase()) {
    return UserRole.Sudo;
  }

  return existingRole || UserRole.User;
}

function getPlanForRole() {
  return Plan.Free;
}

const authConfig: NextAuthConfig = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.type !== "oauth") return true;

      // ── Check for pending account linking ──
      if (account.provider === "github" || account.provider === "google") {
        try {
          const cookieStore = await cookies();
          const linkCookie = cookieStore.get("santet_link");
          if (linkCookie?.value) {
            const parsed = JSON.parse(linkCookie.value);
            if (parsed.provider === account.provider && parsed.userId) {
              await prisma.account.upsert({
                where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } },
                update: {
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                },
                create: {
                  userId: parsed.userId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token || "",
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | null | undefined,
                },
              });
              cookieStore.set("santet_link", "", { maxAge: 0, path: "/" });
              return true;
            }
          }
        } catch {}
      }

      const email = typeof user.email === "string"
        ? user.email
        : typeof profile?.email === "string"
          ? profile.email
          : "";

      if (!email) return false;

      const githubUsername = account.provider === "github"
        ? getGithubUsername(profile)
        : "";
      const role = getRoleForGithubUser(undefined, githubUsername);
      const plan = getPlanForRole();

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        const oauthName = user.name || email.split("@")[0];
        const username = generateUsername(oauthName);
        await prisma.user.create({
          data: {
            name: oauthName,
            username,
            email,
            password: "",
            studyProgram: "TI",
            semester: 1,
            avatar: user.image || "",
            role,
            plan,
          },
        });
      } else if (githubUsername) {
        await prisma.user.update({
          where: { email },
          data: {
            role,
            plan,
          },
        });
      }

      const dbUser = existing || await prisma.user.findUnique({
        where: { email },
      });

      if (!dbUser) return false;

      // ── Create/update Account record ──
      await prisma.account.upsert({
        where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } },
        update: {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          id_token: account.id_token,
        },
        create: {
          userId: dbUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token || "",
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state as string | null | undefined,
        },
      });

      user.id = dbUser.id;
      user.email = dbUser.email;
      user.name = dbUser.name;
      user.image = dbUser.avatar || undefined;
      (user as any).username = dbUser.username;

      return true;
    },
    async jwt({ token, user }) {
      const authUser = user as { id?: string; role?: UserRole; plan?: Plan; username?: string | null; image?: string | null } | undefined;

      if (authUser?.id) {
        token.id = authUser.id;
      }
      if (authUser?.role) {
        token.role = authUser.role;
      }
      if (authUser?.plan) {
        token.plan = authUser.plan;
      }
      if (authUser?.username) {
        token.username = authUser.username;
      }
      if (authUser?.image) {
        token.image = authUser.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.plan = token.plan as Plan;
        session.user.username = token.username as string | null;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
