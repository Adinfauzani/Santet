"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Link2, Shield, Palette, KeyRound, BadgeCheck, ChevronLeft } from "lucide-react";
import EditProfileForm from "./_edit-profile";
import LinkedAccountsSection from "./_linked-accounts";
import VerificationSection from "./_verification";
import TwoFactorSection from "./_two-factor";
import SetPasswordForm from "./_set-password";
import AppearanceSection from "./_appearance";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Link2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface Props {
  emailVerified: boolean;
  email: string;
  linkedProviders: string[];
  hasPassword: boolean;
  allMethods: string[];
  username: string | null | undefined;
  user: {
    name: string;
    username: string | null;
    email: string;
    bio: string;
    avatar: string;
    website: string;
    location: string;
    studyProgram: string;
    semester: number;
  };
  twoFactorEnabled: boolean;
}

export default function SettingsClient(props: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-48 shrink-0 md:block">
        <nav className="sticky top-20 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface hover:text-text",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Mobile tab selector */}
        <div className="mb-6 flex gap-1 overflow-x-auto md:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface hover:text-text",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && (
          <section className="rounded-lg border border-border bg-surface/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-muted" />
              <h2 className="text-sm font-semibold text-text">Profile</h2>
            </div>
            <EditProfileForm user={props.user} />
          </section>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-surface/5 p-4">
              <LinkedAccountsSection
                linkedProviders={props.linkedProviders}
                hasPassword={props.hasPassword}
                allMethods={props.allMethods}
                username={props.username}
              />
            </section>

            {!props.hasPassword && (
              <section className="rounded-lg border border-border bg-surface/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted" />
                  <h2 className="text-sm font-semibold text-text">Password</h2>
                </div>
                <p className="mb-3 text-[11px] text-muted">
                  You signed up with a social account. Set a password to enable email/password sign-in.
                </p>
                <SetPasswordForm />
              </section>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-surface/5 p-4">
              <VerificationSection
                emailVerified={props.emailVerified}
                email={props.email}
              />
            </section>

            <section className="rounded-lg border border-border bg-surface/5 p-4">
              <TwoFactorSection
                twoFactorEnabled={props.twoFactorEnabled}
                hasPassword={props.hasPassword}
              />
            </section>
          </div>
        )}

        {activeTab === "appearance" && (
          <AppearanceSection />
        )}
      </div>
    </div>
  );
}
