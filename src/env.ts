import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    GNEWS_API_KEY: z.string().optional(),
    YOUTUBE_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GNEWS_API_KEY: process.env.GNEWS_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});

export type Env = typeof env;
