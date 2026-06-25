"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { generateUsername } from "@/lib/reserved";

export default function ProfileRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    const user = session?.user as Record<string, unknown> | undefined;
    const username = user?.username as string | undefined;
    if (username) {
      router.push(`/${username}`);
      return;
    }
    if (!session) {
      router.push("/login");
      return;
    }
    const email = (user?.email as string) || "";
    const name = (user?.name as string) || email.split("@")[0];
    const generated = generateUsername(name);
    authClient.updateUser({ username: generated }).then(() => {
      router.push(`/${generated}`);
    }).catch(() => {
      router.push("/dashboard/account");
    });
  }, [isPending, session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">Redirecting...</p>
    </div>
  );
}
