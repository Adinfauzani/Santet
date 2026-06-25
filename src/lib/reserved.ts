const reserved = new Set([
  "about",
  "account",
  "admin",
  "api",
  "appearance",
  "articles",
  "community",
  "contact",
  "dashboard",
  "events",
  "intelligence",
  "legal",
  "login",
  "moderator",
  "news",
  "notifications",
  "plan",
  "privacy",
  "profile",
  "projects",
  "register",
  "research",
  "riset",
  "security",
  "settings",
  "showcase",
  "sudo",
  "terms",
  "unauthorized",
]);

export function isReservedUsername(username: string): boolean {
  return reserved.has(username.toLowerCase());
}

export function isValidUsername(username: string): boolean {
  if (username.length < 2 || username.length > 30) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function generateUsername(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${base || "user"}-${randomSuffix()}`;
}
