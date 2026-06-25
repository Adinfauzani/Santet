import { betterAuth } from "better-auth";
import type { Session as BaseSession } from "better-auth";
import { twoFactor, emailOTP, multiSession, username } from "better-auth/plugins";
import { Pool } from "pg";
import { dash } from "@better-auth/infra";
import { sendVerificationEmail, sendPasswordResetEmail, sendOTP } from "./email";
import { isReservedUsername } from "./reserved";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  username: string;
  studyProgram: string;
  semester: number;
  role: string;
  plan: string;
  avatar: string;
  coverImage: string;
  bio: string;
  website: string;
  location: string;
  reputationPoints: number;
  level: string;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
}

export type AuthSession = BaseSession & { user: AuthUser };

export async function getAuthSession(headers: Headers): Promise<AuthSession | null> {
  return auth.api.getSession({ headers }) as Promise<AuthSession | null>;
}

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!;

export const auth = betterAuth({
  database: new Pool({ connectionString: dbUrl }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    async sendResetPassword(data, request) {
      await sendPasswordResetEmail(data.user.email, data.url);
    },
  },

  emailVerification: {
    sendVerificationEmail: async (data, request) => {
      await sendVerificationEmail(data.user.email, data.url);
    },
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  user: {
    additionalFields: {
      studyProgram: { type: "string", required: true, defaultValue: "TI" },
      semester: { type: "number", required: true, defaultValue: 1 },
      role: { type: "string", required: true, defaultValue: "User" },
      plan: { type: "string", required: true, defaultValue: "Free" },
      avatar: { type: "string" },
      coverImage: { type: "string" },
      bio: { type: "string" },
      website: { type: "string" },
      location: { type: "string" },
      reputationPoints: { type: "number" },
      level: { type: "string" },
    },
    modelName: "user",
    changeEmail: {
      enabled: true,
    },
  },

  plugins: [
    multiSession({ maximumSessions: 5 }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTP(email, otp, type);
      },
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      rateLimit: { window: 60, max: 1 },
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
    }),
    username({
      minUsernameLength: 2,
      maxUsernameLength: 30,
      usernameValidator: (u) => !isReservedUsername(u),
    }),
    twoFactor({
      issuer: "Sant.Ai",
      totpOptions: {
        digits: 6,
        period: 30,
        backupCodes: {
          amount: 10,
          length: 10,
        },
      },
    }),
    dash(),
  ],
});
