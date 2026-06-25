"use client";

import type { User } from "@/generated/prisma/client";
import { MapPin, Globe, Calendar, Award, Pencil, Settings } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/profile/logout-button";

interface Props {
  user: Pick<User, "name" | "username" | "avatar" | "bio" | "location" | "website" | "coverImage" | "reputationPoints" | "level" | "createdAt">;
  isOwner?: boolean;
}

const levelColors: Record<string, string> = {
  Beginner: "text-muted border-border",
  Active: "text-emerald-500 border-emerald-500/30",
  Lead: "text-amber-500 border-amber-500/30",
  Expert: "text-purple-500 border-purple-500/30",
};

export default function ProfileHeader({ user, isOwner }: Props) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div>
      {user.coverImage ? (
        <div className="h-32 rounded-lg border border-border bg-surface/20 md:h-48">
          <img src={user.coverImage} alt="" className="h-full w-full rounded-lg object-cover" />
        </div>
      ) : (
        <div className="h-32 rounded-lg border border-border bg-surface/20 md:h-48" />
      )}

      <div className="flex flex-col items-start gap-4 px-0 md:flex-row md:items-end md:px-6" style={{ marginTop: "-48px" }}>
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-surface text-3xl font-bold text-primary md:h-28 md:w-28">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="flex-1 pb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text md:text-2xl">{user.name}</h1>
            {isOwner && (
              <>
                <button
                  onClick={() => document.getElementById("edit-profile-trigger")?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <Pencil className="h-3 w-3" />
                  Edit profile
                </button>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted transition-colors hover:bg-surface hover:text-text"
                >
                  <Settings className="h-3 w-3" />
                  Settings
                </Link>
                <LogoutButton />
              </>
            )}
          </div>
          <p className="text-sm text-muted">@{user.username}</p>
        </div>
      </div>

      {user.bio && (
        <p className="mt-4 text-sm leading-relaxed text-muted">{user.bio}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {user.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {user.location}
          </span>
        )}
        {user.website && (
          <Link href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
            <Globe className="h-3 w-3" /> {user.website.replace(/^https?:\/\//, "")}
          </Link>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1">
          <Award className="h-3 w-3" /> {user.reputationPoints} pts
          <span className={`ml-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${levelColors[user.level] || levelColors.Beginner}`}>
            {user.level}
          </span>
        </span>
      </div>
    </div>
  );
}
