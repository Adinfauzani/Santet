"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SetPasswordForm() {
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to set password");
        return;
      }
      toast.success("Password set successfully");
      setShowForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to set password");
    } finally {
      setSaving(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface/10 px-3 py-2.5 text-xs text-text transition-colors hover:bg-surface"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Set Password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-text">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border border-border bg-surface/10 px-3 py-2 text-xs text-text outline-none placeholder:text-muted/50"
          placeholder="Min. 8 characters"
          autoFocus
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border border-border bg-surface/10 px-3 py-2 text-xs text-text outline-none placeholder:text-muted/50"
          placeholder="Repeat password"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} size="sm" className="gap-2 text-xs">
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          {saving ? "Saving..." : "Save Password"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => { setShowForm(false); setNewPassword(""); setConfirmPassword(""); }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
