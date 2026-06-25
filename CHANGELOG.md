# Changelog

## [0.4.0] — 2026-06-26

### Breaking
- **Prisma `User` model moved to `auth.user`** — `Users.User` table removed, Prisma now reads/writes directly to Better Auth's `auth.user` table
  - No more sync between two user tables — `prisma.user` is the same as `auth.user`
  - `/api/sync-user` endpoint removed (redundant)
  - `updateProfile` no longer does raw SQL sync to `auth.user`
  - `Pool` import removed from `actions.ts`
  - Register form sends `username`, `studyProgram`, `semester` directly to `authClient.signUp.email()`
  - Profile redirect page simplified (no more sync API call)
- **Prisma schema cleaned up**: `Users` schema removed from datasource, `UserRole`/`Plan` enums removed (Better Auth stores roles/plans as strings)

### Added
- **Email service (Resend)** — custom HTML templates via Resend (subject "Verify Your Sant.Ai Account", OTP in monospace, expiry, footer)
  - Falls back to console.log if `RESEND_API_KEY` not set
  - `@better-auth/infra` `sendEmail` kept as secondary (not enabled on current plan)
- **Username plugin** — replaced manual `additionalFields.username` with Better Auth's `username()` plugin
  - Normalization (lowercasing), `displayUsername`, `isUsernameAvailable` endpoint, `signIn.username()`
  - `usernameValidator` using `isReservedUsername` to block reserved names
  - `updateProfile` now uses `auth.api.updateUser()` so the plugin normalizes the username properly
- **Set password for OAuth users** — `POST /api/account/set-password` API route, `SetPasswordForm` component in Account tab
- **Two-factor authentication** — Better Auth `twoFactor` plugin with TOTP + backup codes
  - `TwoFactorSection` with QR generation (via QR Server API), 6-digit verification, backup codes display
  - `twoFactorClient` plugin on the auth client
  - `TwoFactor` model in Prisma schema (`auth.twoFactor` table, managed by `prisma db push`)
- **Settings sidebar** — new `_settings-client.tsx` with sidebar navigation (Profile, Account, Security, Appearance)
  - Responsive: sidebar on desktop, horizontal tab bar on mobile
  - `_two-factor.tsx` and `_set-password.tsx` as separate components
- **`src/lib/email.ts`** — email service module (Resend client + console fallback); added `sendOTP()` for OTP codes
- **Email OTP login** — Better Auth `emailOTP` plugin with `sendVerificationOTP` callback using Resend
  - Login form: toggle between **Password** mode and **OTP** mode
  - OTP mode: enter email → receive 6-digit code → verify & auto-sign-in
  - New users auto-registered on first OTP sign-in
  - `sendVerificationOnSignUp: true` — OTP sent after email/password registration
  - `overrideDefaultEmailVerification: true` — OTP replaces verification links
- **Multi-session support** — Better Auth `multiSession` plugin (max 5 sessions per device), `multiSessionClient` on client
- **OTP config** — emailOTP plugin configured: 6-digit OTP, 10-min expiry, 5 allowed attempts, 60s rate-limit window
- **VerifyOTP component** — shared verification UI (enter code, resend with cooldown, change email)
- **Post-registration OTP screen** — register form now shows OTP verification instead of "Welcome" screen; user must verify before redirecting to profile
- **Login auto-verification** — after password sign-in, if `emailVerified` is false, OTP is auto-sent and verification screen shown
- **Prisma schema**: added `Session`, `Account`, `Verification` models + `displayUsername` on `User` (fixes "relation session does not exist" error)

### Changed
- Settings page: full restructure with sidebar layout via `SettingsClient` client component
- `auth.ts`: email callbacks use `@better-auth/infra` `sendEmail`; `twoFactor`, `emailOTP`, `multiSession`, `username` plugins added; `AuthUser.twoFactorEnabled` field; `username` removed from `additionalFields`
- `auth-client.ts`: `twoFactorClient`, `emailOTPClient`, `multiSessionClient`, `usernameClient` plugins added
- Login form (`login-form.tsx`): mode toggle Password/OTP, OTP send + verify flow; after password sign-in, auto-detects unverified email and shows OTP verification
- Register form (`register-form.tsx`): post-registration shows `VerifyOTP` component instead of generic success page
- `email.ts`: rewritten with Resend custom HTML templates + `@better-auth/infra` fallback; better error logging with console fallback
- `ProfileRedirect` (`/profile/page.tsx`): auto-generates username from email for OAuth users instead of redirecting to `/login`
- `VerifyOTP` component: amber banner indicating OTP is in server terminal when email fails

## [0.3.1] — 2026-06-26

### Added
- **Email verification** — Better Auth built-in `emailVerification` config with `sendVerificationEmail` callback
  - OAuth users auto-verified (Google always, GitHub if email verified on GitHub)
  - Email/password users: `emailVerified = false`, must verify before content creation
- **Verification UI** — `VerificationSection` in settings (status badge + resend button)
- **Navbar indicator** — amber `AlertCircle` icon on avatar when email unverified
- **Content creation gate** — `requireEmailVerified()` check in `createProject`, `joinProject`, `completeProject`, `addComment`
- **Better Auth account APIs** — `auth.api.listUserAccounts` + `auth.api.unlinkAccount` replacing raw SQL + custom endpoint
- **New API route** — `POST /api/account/unlink` (wraps Better Auth's `unlinkAccount`)
- **Account linking** — Better Auth auto-link by email; `accountLinking.enabled` + `trustedProviders`

### Removed
- `src/app/api/account/unlink/[provider]/route.ts` — custom unlink (replaced by Better Auth's built-in)

### Updated
- Settings page: fetches `auth.api.listUserAccounts` server-side, passes `emailVerified` to `VerificationSection`
- `auth.ts`: enabled `emailVerification`, `account.accountLinking`, `user.changeEmail`
- `LinkedAccountsSection`: calls `/api/account/unlink` instead of `/api/account/unlink/:provider`

## [0.3.0] — 2026-06-25

### Changed (Breaking)
- **Auth.js v5 → Better Auth** — full migration to self-hosted Better Auth
- Server config: `betterAuth()` with Pool adapter (`search_path=auth`), email/password, Google + GitHub OAuth, `additionalFields`, `dash()` plugin
- Client SDK: `createAuthClient()` + `sentinelClient()`
- `next-auth` uninstalled, all imports replaced

### Removed
- `src/app/api/auth/[...nextauth]/route.ts` — old Auth.js route handler
- `src/types/next-auth.d.ts` — Auth.js type declarations
- `prisma/schema.prisma`: `Account`, `Session`, `VerificationToken` models + relations from `User`

### Added
- `src/lib/auth.ts` — Better Auth config with `AuthUser`/`AuthSession` types and `getAuthSession()` server wrapper
- `src/lib/auth-client.ts` — client SDK (`signIn`, `signOut`, `useSession`)
- `src/app/api/auth/[...all]/route.ts` — Better Auth API handler
- `src/app/api/sync-user/route.ts` — sync endpoint: creates `Users.User` record after Better Auth signup
- `scripts/migrate-users.ts` — one-time script to migrate existing Auth.js users to Better Auth tables

### Updated
- Login/Register forms: `authClient.signIn.email()` / `signIn.social()` / `signUp.email()`
- `proxy.ts`: cookie-based auth guard (`better-auth.session_token`) instead of `getToken()`
- `src/lib/actions.ts`: `getAuthSession()` instead of `auth()`, removed `registerUser`/`loginUser`
- All client components: `useSession()` from `@/lib/auth-client`, `signOut()` without `redirectTo`
- All server components: `getAuthSession()` server wrapper
- `src/app/(dashboard)/[username]/settings/page.tsx`: raw SQL queries for `auth.account`
- `next.config.ts`: removed `NEXTAUTH_URL` env passthrough
- `.env`: `BETTER_AUTH_URL` added, `NEXTAUTH_URL` removed

## [0.2.2] — 2026-06-25

### Added
- `proxy.ts`: auth guard for `/dashboard` and `/profile`
- Dashboard role-check layout (`Sudo`/`Admin` only)
- Register auto-login after signup

### Fixed
- Login redirect chain (`/profile` → `/login` loop)
- Vercel build timeout (split into hybrid server + client auth)
- User auto-creation on credential login if `Users.User` record missing

## [0.2.1] — 2026-06-24

### Fixed
- `NEXTAUTH_URL` resolution for Vercel deployment
- Theme flash on page load
- Route restructure for dashboard sections
- Primitive login/register UI consistency

## [0.2.0] — 2026-06-24

### Added
- SEO optimizations
- Legal pages (Terms, Privacy, Guidelines, Data)

### Changed
- UI/UX redesign: primitive/minimalist (border-2, flat, no shadows, centered card, system font)
- Fix login/register flow bugs

## [0.1.0] — 2026-06-23

### Added
- Initial release
- Next.js 16 with Turbopack
- Prisma (PostgreSQL — Neon)
- NextAuth v5 with credentials + Google/GitHub OAuth
- Dashboard with role-based access
- Projects (CRUD, showcase)
- Events pages
- Intelligence section (YouTube + GNews)
