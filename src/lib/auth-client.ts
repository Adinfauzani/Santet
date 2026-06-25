import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";
import { twoFactorClient, emailOTPClient, multiSessionClient, usernameClient } from "better-auth/client/plugins";

const baseURL = typeof window !== "undefined"
  ? window.location.origin
  : process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
  plugins: [
    sentinelClient(),
    twoFactorClient(),
    emailOTPClient(),
    multiSessionClient(),
    usernameClient(),
  ],
});

export const { signIn, signOut, useSession } = authClient;
