"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { getStorage, setStorage } from "@/lib/storage";
import type { ReactNode } from "react";

const SESSION_TIMEOUT = 60 * 60 * 1000;

function SessionTimeoutManager() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      setStorage("last-active", "");
      return;
    }

    const updateLastActive = () => {
      setStorage("last-active", String(Date.now()));
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, updateLastActive));

    const interval = window.setInterval(() => {
      const lastActive = Number(getStorage("last-active") || Date.now());

      if (Date.now() - lastActive >= SESSION_TIMEOUT) {
        setStorage("last-active", "");
        signOut({ redirect: false }).then(() => {
          toast.error("Sesi telah habis. Silakan login kembali.");
          router.push("/login");
        });
      }
    }, 60 * 1000);

    updateLastActive();

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateLastActive));
      window.clearInterval(interval);
    };
  }, [router, status]);

  return null;
}

function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAccepted(getStorage("cookie-consent") === "accepted");
  }, []);

  const accept = () => {
    setStorage("cookie-consent", "accepted");
    setAccepted(true);
  };

  if (!mounted || accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] border-2 border-text/20 bg-background/80 p-4 backdrop-blur-md md:left-auto md:w-[420px]">
      <p className="text-xs font-bold uppercase text-text">🍪 Cookie Notice</p>
      <p className="mt-1 text-xs leading-relaxed text-text/70">
        Kami pakai cookie untuk sesi login & preferensi.{" "}
        <Link href="/legal/privacy" className="font-bold underline hover:no-underline">Privacy</Link>
        {" "}&{" "}
        <Link href="/legal/terms" className="font-bold underline hover:no-underline">Terms</Link>.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={accept}
          className="border-2 border-text bg-text px-3 py-1.5 text-xs font-bold text-background hover:opacity-90"
        >
          Terima
        </button>
      </div>
    </div>
  );
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionTimeoutManager />
      <CookieConsent />
      {children}
    </SessionProvider>
  );
}
