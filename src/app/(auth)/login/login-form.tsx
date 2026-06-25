"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Github, Loader2, KeyRound, Mail } from "lucide-react";
import VerifyOTP from "@/components/shared/verify-otp";

export default function LoginForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<"password" | "otp" | "verify">("password");

  useEffect(() => {
    const user = session?.user as { username?: string; emailVerified?: boolean } | undefined;
    if (!user) return;
    if (user.emailVerified && user.username) {
      router.push(`/${user.username}`);
    }
  }, [session, router]);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await authClient.signIn.email({ email, password });

    if (err) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const user = (await authClient.getSession()).data?.user as { emailVerified?: boolean } | undefined;
    if (user && !user.emailVerified) {
      await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" } as any);
      setMode("verify");
    }
    setLoading(false);
  }

  async function handleSendOTP() {
    setLoading(true);
    setError("");
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    if (err) {
      setError(err.message || "Failed to send OTP");
      setLoading(false);
      return;
    }
    setLoading(false);
    setMode("verify");
  }

  async function handleOTPSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    if (err) {
      setError(err.message || "Invalid code");
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await authClient.signIn.social({ provider: provider as "google" | "github" });
    setOauthLoading(null);
  }

  function handleVerified() {
    const username = (session?.user as { username?: string } | undefined)?.username;
    router.push(username ? `/${username}` : "/profile");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border-2 border-text p-8">
        <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide text-text">
          Sign In
        </h1>

        {/* OAuth */}
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

        {/* Mode Toggle */}
        <div className="mb-4 flex border-2 border-text text-xs">
          <button
            type="button"
            onClick={() => { setMode("password"); setError(""); }}
            className={`flex-1 py-2 text-center font-bold uppercase transition-colors ${
              mode === "password" ? "bg-text text-background" : "text-text hover:bg-text/10"
            }`}
          >
            <KeyRound className="mr-1.5 inline h-3 w-3" />
            Password
          </button>
          <button
            type="button"
            onClick={() => { setMode("otp"); setError(""); setOtp(""); }}
            className={`flex-1 py-2 text-center font-bold uppercase transition-colors ${
              mode === "otp" || mode === "verify" ? "bg-text text-background" : "text-text hover:bg-text/10"
            }`}
          >
            <Mail className="mr-1.5 inline h-3 w-3" />
            OTP
          </button>
        </div>

        {/* Password Mode */}
        {mode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@univ.ac.id"
                className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="enter password"
                  className="w-full border-2 border-text bg-background px-3 py-2 pr-10 text-sm text-text placeholder:text-text/30 focus:outline-none" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase text-text hover:underline" tabIndex={-1}>
                  {show ? "hide" : "show"}
                </button>
              </div>
            </div>
            {error && (
              <p className="border-2 border-red-600 bg-red-600/10 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full border-2 border-text bg-text px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* OTP Mode — enter email */}
        {mode === "otp" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-text">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@univ.ac.id"
                className="w-full border-2 border-text bg-background px-3 py-2 text-sm text-text placeholder:text-text/30 focus:outline-none" />
            </div>
            {error && (
              <p className="border-2 border-red-600 bg-red-600/10 px-3 py-2 text-xs text-red-600">{error}</p>
            )}
            <button onClick={handleSendOTP} disabled={loading || !email}
              className="w-full border-2 border-text bg-text px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p className="text-center text-[10px] text-text/60">
              New users will be automatically registered.
            </p>
          </div>
        )}

        {/* Verify Mode */}
        {mode === "verify" && (
          <VerifyOTP email={email} onVerified={handleVerified} type={session ? "email-verification" : "sign-in"} />
        )}

        <p className="mt-6 text-center text-xs text-text">
          No account?{" "}
          <Link href="/register" className="font-bold underline hover:no-underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
