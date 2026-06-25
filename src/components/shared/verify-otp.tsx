"use client";

import { useState, useRef, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Loader2, Terminal } from "lucide-react";

interface Props {
  email: string;
  onVerified: () => void;
  onChangeEmail?: () => void;
  type?: "email-verification" | "sign-in";
}

export default function VerifyOTP({ email, onVerified, onChangeEmail, type = "email-verification" }: Props) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      intervalRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    setLoading(true);
    setError("");

    const { error: err } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    } as any);

    if (err) {
      setError(err.message || "Invalid code");
      setLoading(false);
      return;
    }
    onVerified();
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");

    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    } as any);

    setLoading(false);
    if (err) {
      setError(err.message || "Failed to resend code");
      return;
    }
    setCooldown(60);
  }

  return (
    <div className="w-full max-w-sm border-2 border-text p-8">
      <h2 className="mb-2 text-xl font-bold uppercase text-text">
        Verify Email
      </h2>
      <p className="mb-6 text-xs text-text/70">
        Enter the 6-digit verification code sent to <strong className="text-text">{email}</strong>
        {onChangeEmail && (
          <>
            {" "}·{" "}
            <button type="button" onClick={onChangeEmail} className="underline hover:no-underline">
              change
            </button>
          </>
        )}
      </p>

      <div className="mb-4 rounded border-2 border-amber-500/30 bg-amber-500/5 px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] text-amber-600">
          <Terminal className="h-3 w-3" />
          OTP not delivered? Check the server terminal for the code.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          inputMode="numeric"
          autoFocus
          placeholder="000000"
          className="w-full border-2 border-text bg-background px-3 py-2 text-center text-lg tracking-[8px] text-text placeholder:text-text/30 focus:outline-none"
        />

        {error && (
          <p className="border-2 border-red-600 bg-red-600/10 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full border-2 border-text bg-text px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Verify"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full text-center text-[11px] text-text underline hover:no-underline disabled:no-underline disabled:text-text/30"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    </div>
  );
}
