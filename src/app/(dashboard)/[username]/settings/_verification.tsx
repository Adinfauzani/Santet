"use client";

import { useState } from "react";
import { BadgeCheck, Mail, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  emailVerified: boolean;
  email: string;
}

export default function VerificationSection({ emailVerified, email }: Props) {
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send verification email");
        return;
      }
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {emailVerified ? (
          <BadgeCheck className="h-4 w-4 text-emerald-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        )}
        <h2 className="text-sm font-semibold text-text">Email Verification</h2>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text">{email}</p>
          <p className={cn("text-[11px]", emailVerified ? "text-emerald-500" : "text-amber-500")}>
            {emailVerified ? "Verified" : "Not verified"}
          </p>
        </div>
        {!emailVerified && (
          <button
            onClick={handleResend}
            disabled={sending}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[11px] text-text transition-colors hover:bg-surface disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Mail className="h-3 w-3" />
            )}
            Resend verification
          </button>
        )}
      </div>
    </div>
  );
}
