# Audit v0.5.0 — Sant.Ai MVP

**Tanggal:** 30 Juni 2026
**Versi Saat Ini:** v0.5.0
**Auditor:** Adin (PM)

---

## Ringkasan

Sant.Ai MVP telah melewati 5 iterasi (23–27 Juni). Seluruh fondasi proyek selesai:
auth, database, dashboard, profile, dokumentasi. Fase selanjutnya adalah
Product Stabilization (v0.6.0) dengan target rilis Agustus 2026.

---

## Status per Modul

| Modul | Status | Catatan |
|-------|--------|---------|
| Authentication | ✅ 100% | Better Auth, 2FA, OTP, OAuth Google/GitHub |
| Profile | ✅ 100% | 3-column layout, README, badges, tech stack, reputation |
| Dashboard | ✅ 85% | Beberapa komponen masih mock/belum terhubung API |
| Intelligence | ✅ 80% | Fetcher RSS/GNews/YouTube jalan, UI kategori 3 tema |
| Projects | ✅ 100% | CRUD, join, complete, comment, pin, showcase |
| Settings | ✅ 90% | Profile, Account, Security, Appearance, Verification |
| Dokumentasi | ✅ 100% | BRD, PRD, UI Spec, BPRD (DOCX), CHANGELOG |
| Wireframe | ✅ 100% | 7 halaman HTML interaktif |
| Mockup React | ✅ 100% | 3 komponen Tailwind + Radix |
| Audit & Planning | ✅ 100% | Linear terintegrasi, roadmap, milestones |

---

## Item Tersisa (14 Issue)

### 🔴 High Priority — Sebelum v0.6 Rilis

| ID | Item | Modul | Tim |
|----|------|-------|-----|
| BRO-18 | Dashboard Articles — live API | Intelligence | FE |
| BRO-19 | Keywords — DB persistence | Dashboard | BE |
| BRO-20 | Change email API route | Settings | BE |

### 🟡 Medium Priority

| ID | Item | Modul | Tim |
|----|------|-------|-----|
| BRO-21 | Sources — CRUD | Dashboard | BE |
| BRO-22 | Image Upload endpoint | Settings | BE |
| BRO-23 | Set RESEND_API_KEY | DevOps | BE |
| BRO-24 | Set GNEWS_API_KEY | DevOps | BE |
| BRO-25 | Set YOUTUBE_API_KEY | DevOps | BE |
| BRO-31 | Migrasi API ke FastAPI | Backend | BE+FE |

### 🟢 Low Priority

| ID | Item | Modul | Tim |
|----|------|-------|-----|
| BRO-26 | Profile Articles Tab | Profile | FE |
| BRO-27 | Profile Achievements Tab | Profile | FE |
| BRO-28 | Profile Activity Tab | Profile | FE |
| BRO-29 | Prisma Neon cold-start retry | Backend | BE |
| BRO-30 | Hapus model Idea/Vote | Backend | BE |

---

## Timeline

```
v0.1 — 23 Jun  🟢 Initial Release
v0.2 — 24 Jun  🟢 UI Redesign
v0.3 — 25 Jun  🟢 Better Auth
v0.4 — 26 Jun  🟢 Email & 2FA
v0.5 — 27 Jun  🟢 Profile & Docs
────────────────────────────
Audit — 28 Jun–5 Jul  🟡 Fase Audit
v0.6 — 6 Jul–3 Agu     🔵 Sprint FE + BE
v0.6.5 — Agu            🟣 Handover ke Tim
```

---

## Arsitektur Saat Ini

```
Frontend: Next.js 16 + Tailwind + Radix UI
Backend:  Next.js API Routes + Prisma + PostgreSQL (Neon)
Auth:     Better Auth (email/password, OAuth, 2FA, OTP)
Fetcher:  RSS, GNews API, YouTube Data API v3
Email:    Resend
Storage:  Vercel Blob (belum aktif)
```

---

## Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Neon cold-start | Error di settings page | Tambah retry wrapper (BRO-29) |
| API key belum diset | Fetcher skip, email gagal | Set segera (BRO-23/24/25) |
| Belum ada testing | Regression | Manual test dulu |
