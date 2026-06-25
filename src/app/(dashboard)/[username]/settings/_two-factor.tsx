"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Shield, ShieldCheck, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  twoFactorEnabled: boolean;
  hasPassword: boolean;
}

export default function TwoFactorSection({ twoFactorEnabled, hasPassword }: Props) {
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGetTotpUri = async () => {
    setEnabling(true);
    try {
      const res = await authClient.twoFactor.getTotpUri({
        password: hasPassword ? "" : undefined,
      });
      if (res.error) {
        toast.error(res.error.message || "Failed to get TOTP URI");
        setEnabling(false);
        return;
      }
      setTotpUri(res.data?.totpURI || null);
    } catch {
      toast.error("Failed to setup two-factor authentication");
    } finally {
      setEnabling(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Code must be 6 digits");
      return;
    }
    setVerifying(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({ code: verificationCode });
      if (res.error) {
        toast.error(res.error.message || "Invalid code");
        setVerifying(false);
        return;
      }

      const bc = await authClient.twoFactor.generateBackupCodes({
        password: hasPassword ? "" : undefined,
      });
      if (bc.data?.backupCodes) {
        setBackupCodes(bc.data.backupCodes);
      }
      toast.success("Two-factor authentication enabled");
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    setDisabling(true);
    try {
      const res = await authClient.twoFactor.disable({
        password: hasPassword ? "" : undefined,
      });
      if (res.error) {
        toast.error(res.error.message || "Failed to disable");
        setDisabling(false);
        return;
      }
      setTotpUri(null);
      setBackupCodes(null);
      toast.success("Two-factor authentication disabled");
    } catch {
      toast.error("Failed to disable two-factor authentication");
    } finally {
      setDisabling(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    const bc = await authClient.twoFactor.generateBackupCodes({
      password: hasPassword ? "" : undefined,
    });
    if (bc.data?.backupCodes) {
      setBackupCodes(bc.data.backupCodes);
    }
  };

  const copyBackupCodes = () => {
    if (!backupCodes) return;
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── 2FA enabled, already has backup codes ── */
  if (twoFactorEnabled && !totpUri) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs font-medium text-text">Two-Factor Authentication</p>
              <p className="text-[11px] text-emerald-500">Enabled</p>
            </div>
          </div>
          <Button
            onClick={handleDisable}
            disabled={disabling}
            variant="ghost"
            size="sm"
            className="gap-2 text-[11px] text-red-500"
          >
            {disabling && <Loader2 className="h-3 w-3 animate-spin" />}
            Disable
          </Button>
        </div>
        <Button onClick={handleGenerateBackupCodes} variant="ghost" size="sm" className="text-[11px]">
          View backup codes
        </Button>
      </div>
    );
  }

  /* ── Show backup codes ── */
  if (backupCodes && !totpUri) {
    return (
      <div className="space-y-4">
        {twoFactorEnabled && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-medium text-text">Two-Factor Authentication Enabled</p>
          </div>
        )}
        <div className="rounded-lg border border-border bg-surface/10 p-3">
          <p className="mb-2 text-[11px] font-medium text-text">Backup Codes</p>
          <p className="mb-2 text-[10px] text-muted">
            Save these codes securely. Each code can be used once to sign in if you lose access to your authenticator app.
          </p>
          <div className="mb-3 grid grid-cols-2 gap-1 font-mono text-[11px] text-text">
            {backupCodes.map((code, i) => (
              <span key={i}>{code}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyBackupCodes} size="sm" variant="ghost" className="gap-2 text-[11px]">
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => setBackupCodes(null)} size="sm" variant="ghost" className="text-[11px]">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Setup step: scan QR + verify ── */
  if (totpUri) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted" />
          <p className="text-xs font-medium text-text">Setup Two-Factor Authentication</p>
        </div>
        <p className="text-[11px] text-muted">
          Scan the QR code with your authenticator app, then enter the 6-digit code.
        </p>
        <div className="flex justify-center">
          <div className="rounded-lg border border-border bg-white p-4 dark:bg-surface/20">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
              alt="TOTP QR Code"
              className="h-48 w-48"
            />
          </div>
        </div>
        <div className="text-center">
          <span
            className="cursor-pointer text-[10px] text-muted underline"
            onClick={() => navigator.clipboard.writeText(totpUri)}
          >
            Copy setup key
          </span>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text">Verification Code</label>
          <div className="flex gap-2">
            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="flex-1 rounded border border-border bg-surface/10 px-3 py-2 text-xs text-text outline-none"
              placeholder="000000"
              inputMode="numeric"
              autoFocus
            />
            <Button onClick={handleVerify} disabled={verifying} size="sm" className="gap-2 text-xs">
              {verifying && <Loader2 className="h-3 w-3 animate-spin" />}
              Verify
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Default: not enabled ── */
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted" />
        <div>
          <p className="text-xs font-medium text-text">Two-Factor Authentication</p>
          <p className="text-[11px] text-muted">Add an extra layer of security</p>
        </div>
      </div>
      <Button onClick={handleGetTotpUri} disabled={enabling} size="sm" className="gap-2 text-xs">
        {enabling && <Loader2 className="h-3 w-3 animate-spin" />}
        {enabling ? "Setting up..." : "Enable"}
      </Button>
    </div>
  );
}
