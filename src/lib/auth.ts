import { betterAuth } from "better-auth";
import type { Session as BaseSession } from "better-auth";
import { Pool } from "pg";
import { dash } from "@better-auth/infra";

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
}

export type AuthSession = BaseSession & { user: AuthUser };

export async function getAuthSession(headers: Headers): Promise<AuthSession | null> {
  return auth.api.getSession({ headers }) as Promise<AuthSession | null>;
}

const dbUrl = new URL(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);
dbUrl.hostname = dbUrl.hostname.replace("-pooler", "");
dbUrl.searchParams.set("options", "-c search_path=auth");

export const auth = betterAuth({
  database: new Pool({ connectionString: dbUrl.toString() }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
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

  user: {
    additionalFields: {
      username: { type: "string", required: true, unique: true, input: true },
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
  },

  plugins: [
    dash(),
  ],
});
