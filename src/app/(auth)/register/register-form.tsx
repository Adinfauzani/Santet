"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Github, Loader2 } from "lucide-react";
import VerifyOTP from "@/components/shared/verify-otp";

const studyPrograms = [
  { value: "SD", label: "Sains Data (SD)" },
  { value: "TI", label: "Teknik Informatika (TI)" },
  { value: "SI", label: "Sistem Informasi (SI)" },
];

const rules = [
  { label: "min 8 characters", test: (v: string) => v.length >= 8 },
  { label: "uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "number", test: (v: string) => /[0-9]/.test(v) },
  { label: "special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function RegisterForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const u = (session?.user as { username?: string } | undefined)?.username;
    if (u) router.push(`/${u}`);
  }, [session, router]);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordErrors = useMemo(
    () => rules.map((r) => ({ label: r.label, pass: r.test(password) })),
    [password],
  );
  const passwordOk = passwordErrors.every((r) => r.pass);
  const confirmOk = confirm.length === 0 || password === confirm;

  function generateUsername(name: string) {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passwordOk || !agreed) return;

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
        username: generateUsername(name),
        studyProgram: studyProgram || "TI",
        semester: parseInt(semester) || 1,
      } as any);

      if (err) {
        throw new Error(err.message || err.code || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await authClient.signIn.social({ provider: provider as "google" | "github" });
    setOauthLoading(null);
  }

  function handleVerified() {
    router.push("/profile");
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <VerifyOTP email={email} onVerified={handleVerified} type="email-verification" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm border-2 border-text p-8">
        <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide text-text">
          Register
        </h1>

        <div className="mb-6 space-y-2">
          <button
            onClick={() => handleOAuth("github")}
            disabled={oauthLoading !== null}
            className="flex w-full items-center justify-center gap-2 border-2 border-text bg-background px-4 py-2 text-sm text-text hover:bg-text hover:text-background disabled:opacity-50"
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            GitHub
          </button>
          <button
            onClick={() => handleOAuth("google")}
            disabled={oauthLoading !== null}
            className="flex w-full items-center justify-center gap-2 border-2 border-text bg-background px-4 py-2 text-sm text-text hover:bg-text hover:text-background disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 border-t-2 border-text" />
          <span className="text-xs uppercase text-text">or</span>
          <div className="flex-1 border-t-2 border-text" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase text-text">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe"
              className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase text-text">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@univ.ac.id"
              className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="studyProgram" className="mb-1 block text-xs font-bold uppercase text-text">Program</label>
              <select id="studyProgram" value={studyProgram} onChange={(e) => setStudyProgram(e.target.value)} required
                className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text focus:outline-none">
                <option value="">Pick</option>
                {studyPrograms.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="mb-1 block text-xs font-bold uppercase text-text">Semester</label>
              <input id="semester" type="number" min={1} max={14} value={semester} onChange={(e) => setSemester(e.target.value)} required placeholder="1"
                className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold uppercase text-text">Password</label>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="create password"
                className="w-full border-2 border-text bg-background px-3 py-2 pr-14 text-sm text-text placeholder:text-text/30 focus:outline-none" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase text-text hover:underline" tabIndex={-1}>
                {show ? "hide" : "show"}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {passwordErrors.map((r) => (
                  <li key={r.label} className="flex items-center gap-1.5 text-[11px]">
                    <span className={r.pass ? "text-text" : "text-text/30"}>{r.pass ? "✓" : "○"}</span>
                    <span className={r.pass ? "text-text" : "text-text/40"}>{r.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-bold uppercase text-text">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              placeholder="re-enter password"
              className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
            {confirm.length > 0 && !confirmOk && (
              <p className="mt-1 text-[11px] text-red-600">✗ passwords do not match</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 border-2 border-text text-text accent-text" />
            <span className="text-[11px] text-text">
              I agree to the{" "}
              <Link href="#" className="font-bold underline hover:no-underline">Community Guidelines</Link>,{" "}
              <Link href="#" className="font-bold underline hover:no-underline">Terms of Service</Link>, and Academic Collaboration Policy.
            </span>
          </label>

          {error && <p className="border-2 border-red-600 bg-red-600/10 px-3 py-2 text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={loading || !passwordOk || !agreed}
            className="w-full border-2 border-text bg-text px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text">
          Already have an account?{" "}
          <Link href="/login" className="font-bold underline hover:no-underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
