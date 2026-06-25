"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, Sun, Moon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/theme-provider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Showcase", href: "/showcase" },
  { label: "Community", href: "/community" },
  { label: "Events", href: "/events" },
  { label: "Intelligence", href: "/intelligence" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const goToProfile = () => {
    const username = (session?.user as { username?: string } | undefined)?.username;
    if (username) {
      router.push(`/${username}`);
    } else {
      router.push("/profile");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container-main flex h-14 items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-white">
            SA
          </div>
          <span className="text-sm font-semibold text-text">Sant.Ai</span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm transition-colors",
                isActive(link.href) ? "text-text" : "text-muted hover:text-text",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-text"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {session?.user && (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-text"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-background p-2 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-semibold text-text">Notifications</p>
                    </div>
                    <div className="py-2 text-center text-xs text-muted">No notifications</div>
                  </div>
                )}
              </div>

              <div className="relative">
                {(session?.user as any)?.emailVerified === false && (
                  <Link href={`/${(session.user as any).username || "settings"}/settings`}>
                    <AlertCircle className="absolute -right-1 -top-1 h-3 w-3 text-amber-500" />
                  </Link>
                )}
                <a
                  href={(session?.user as any)?.username ? `/${(session.user as any).username}` : "/profile"}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-xs font-semibold text-text hover:opacity-80"
                >
                  {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                </a>
              </div>
            </>
          )}

          {!session?.user && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 px-3 text-xs">Get started</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-text md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 border-l border-border bg-background p-4">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    isActive(link.href) ? "bg-surface text-text" : "text-muted hover:bg-surface hover:text-text",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {!session?.user && (
              <div className="mt-6 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-xs">Sign in</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full text-xs">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
