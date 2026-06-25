"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.username) {
      router.replace(`/${session.user.username}`);
    } else {
      router.replace("/login");
    }
  }, [session, status, router]);

  return null;
}
