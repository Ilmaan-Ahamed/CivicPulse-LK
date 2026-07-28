# CivicPulse LK — Task Checklist

Execution checklist for the CivicPulse LK platform. Tasks are ordered by dependency — each phase builds on the previous.

---

## Phase 1: Project Scaffolding & Foundation
- [x] Initialize Next.js 15 app (App Router, TypeScript, Tailwind CSS, ESLint)
- [x] Install all dependencies (Clerk, Prisma, Shadcn UI, Gemini SDK, MinIO, Zod, React Hook Form, next-intl, Mapbox GL)
- [x] Configure Tailwind CSS + Shadcn UI theme (dark mode, brand colors)
- [x] Set up path aliases in `tsconfig.json`
- [x] Create `.env.local.example` with all required env variables
- [x] Create `docker-compose.yml` for local PostgreSQL + PostGIS + MinIO
- [x] Write `prisma/schema.prisma` — all models, enums, relations
- [ ] Run `npx prisma db push` to create tables (requires live DB connection)
- [x] Create `src/lib/db.ts` — Prisma singleton client
- [x] Create `src/lib/minio.ts` — MinIO client + upload/download helpers
- [ ] Install Shadcn UI components

---

## Phase 2: Authentication & Role-Based Access
- [x] Configure Clerk provider in `src/app/layout.tsx`
- [x] Create sign-in page `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- [x] Create sign-up page `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- [x] Create `src/middleware.ts` — Clerk middleware with RBAC route protection
- [x] Create `src/lib/auth.ts` — `requireRole()`, `getCurrentUser()`, `hasPermission()` helpers
- [x] Create `src/app/api/webhooks/clerk/route.ts` — Sync Clerk users to DB
- [x] Create Zod validation schemas in `src/lib/validators.ts`
- [x] Test: Verify sign-up creates DB user, role-based redirects work

---

## Phase 3: Landing Page & Core Layout
- [x] Create `src/components/layout/navbar.tsx` — Logo, nav links, Clerk UserButton, role-based nav, language switcher, mobile responsive
- [x] Create `src/components/layout/footer.tsx`
- [x] Create `src/app/(public)/page.tsx` — Landing page with sections:
  - [x] Hero section (headline, animated background, CTA)
  - [x] Problem section (Sri Lanka infrastructure stats)
  - [x] How It Works (4-step: Report → Verify → Assign → Resolve)
  - [x] Features section (platform capabilities)
  - [x] Final CTA (sign up / start reporting)
- [x] Set up `src/app/(public)/layout.tsx` — Public layout (navbar + footer)
- [x] Set up `src/app/(protected)/layout.tsx` — Protected layout (navbar + sidebar)
- [x] Ensure full responsive design (mobile, tablet, desktop)

---

## Phase 4: Citizen Reporting Module
- [x] Create `src/components/shared/photo-upload.tsx` — Drag-drop, multi-file, preview
- [x] Create `src/components/shared/map-view.tsx` — Mapbox map component with pin placement
- [x] Create `src/components/reports/report-form.tsx` — Category, description, photos, GPS
- [x] Create `src/app/(protected)/reports/new/page.tsx` — Report submission page
- [x] Create `src/app/api/reports/route.ts`:
  - [x] `POST` — Create report (Zod validation, photo upload to MinIO, PostGIS point)
  - [x] `GET` — List reports (filters: status, category, user, proximity)
- [x] Create `src/app/api/upload/route.ts` — File upload endpoint (MinIO)
- [x] Create `src/components/reports/report-card.tsx` — Report summary card
- [x] Create `src/app/(protected)/reports/page.tsx` — "My Reports" list with status badges
- [x] Create `src/app/(protected)/reports/[id]/page.tsx` — Report detail (timeline, status, verifications)
- [x] Create `src/app/api/reports/[id]/route.ts` — Single report CRUD
- [x] Test: Submit report with photo + GPS, verify DB record + MinIO upload

---

## Phase 5: Community Verification Module
- [x] Create `src/lib/trust-score.ts` — Trust score calculation algorithm
- [x] Create `src/components/verification/verify-card.tsx` — Nearby report card for verification
- [x] Create `src/app/(protected)/verify/page.tsx` — Map + list of nearby unverified reports (PostGIS `ST_DWithin`)
- [x] Create `src/components/verification/verify-form.tsx` — Confirm/Dispute/Needs Info + comments + photos
- [x] Create `src/app/(protected)/verify/[id]/page.tsx` — Verification form page
- [x] Create `src/app/api/verifications/route.ts`:
  - [x] `POST` — Submit verification (proximity check, update trust score)
  - [x] Escalation logic: 3+ confirms → status = VERIFIED
- [x] Test: Verify report from nearby location, confirm status escalation + trust score update

---

## Phase 6: AI Triage Service
- [x] Create `src/lib/ai/prompts.ts` — Structured prompts for Gemini:
  - [x] Duplicate detection prompt
  - [x] Category classification prompt
  - [x] Priority scoring prompt
  - [x] Description summarization prompt
- [x] Create `src/lib/ai/triage.ts` — Gemini AI integration:
  - [x] `detectDuplicate(report)` — Compare against recent reports
  - [x] `classifyCategory(description)` — Auto-suggest category
  - [x] `scorePriority(report)` — CRITICAL/HIGH/MEDIUM/LOW
  - [x] `summarizeDescription(description)` — Concise summary
- [x] Create `src/app/api/triage/route.ts` — Trigger triage (async after report creation)
- [x] Store AI results as advisory metadata on report (never auto-overrides)
- [x] Test: Submit report → verify AI triage runs → check results stored correctly

---

## Phase 7: DS Office Coordination Console
  - [ ] `POST` — Create assignment
  - [ ] `PATCH` — Update assignment status
  - [ ] Audit log every action
- [ ] Create `src/app/(protected)/ds-console/agencies/page.tsx` — Manage agencies/NGOs/teams
- [ ] Create `src/app/api/agencies/route.ts` — CRUD for agencies
- [ ] Test: DS Officer views verified queue → assigns → verify audit log

---

## Phase 8: Field Verification & Evidence
- [ ] Create `src/app/(protected)/field/page.tsx` — Assigned reports for field inspection
- [ ] Create `src/components/field/inspection-form.tsx` — Findings, photos, GPS proof, resolution status
- [ ] Create `src/app/(protected)/field/[id]/page.tsx` — Field verification form page
- [ ] Create `src/app/api/inspections/route.ts`:
  - [ ] `POST` — Submit inspection (photos to MinIO, GPS evidence)
  - [ ] Update report status (RESOLVED / PARTIALLY_RESOLVED / ESCALATE)
- [ ] Test: Field inspector submits inspection → report status updates → evidence attached

---

## Phase 9: Public Transparency Dashboard
- [ ] Install charting library (Recharts)
- [ ] Create `src/components/dashboard/stats-card.tsx` — Overview stat cards
- [ ] Create `src/components/dashboard/status-chart.tsx` — Reports by status (pie/donut)
- [ ] Create `src/components/dashboard/category-chart.tsx` — Reports by category (bar)
- [ ] Create `src/components/dashboard/resolution-timeline.tsx` — Avg resolution time trend
- [ ] Create `src/components/dashboard/report-map.tsx` — Map of all reports (color by status)
- [ ] Create `src/app/(public)/dashboard/page.tsx` — Public dashboard page:
  - [ ] Overview stats (total, verified, resolved, avg time)
  - [ ] Charts (status, category, timeline)
  - [ ] Map view
  - [ ] Recent activity feed
  - [ ] Filters (district, category, date range, status)
- [ ] Create `src/app/api/dashboard/route.ts` — Aggregation queries
- [ ] Test: Dashboard loads with data, filters work, responsive on mobile

---

## Phase 10: Internationalization (i18n)
- [ ] Configure `next-intl` in `next.config.ts` and layout
- [ ] Create `src/i18n/en.json` — English translations (all UI strings)
- [ ] Create `src/i18n/si.json` — Sinhala translations (placeholder → fill later)
- [ ] Create `src/i18n/ta.json` — Tamil translations (placeholder → fill later)
- [ ] Create `src/components/shared/language-switcher.tsx`
- [ ] Extract all hardcoded strings to translation keys
- [ ] Test: Switch between EN/SI/TA, verify all pages update

---

## Phase 11: Testing & Quality Assurance
- [ ] Set up Vitest for unit tests
- [ ] Write unit tests: trust score calculation, Zod validators, AI prompt builders
- [ ] Set up Playwright for E2E tests
- [ ] Write E2E test: Full report lifecycle (submit → verify → assign → field verify → resolve)
- [ ] Write E2E test: Role-based access control (citizen can't access DS console)
- [ ] Write E2E test: Language switching
- [ ] Security testing: auth bypass attempts, SQL injection, file upload validation
- [ ] Performance audit: Lighthouse scores, API response times

---

## Phase 12: DevOps & Deployment
- [ ] Create `.github/workflows/ci.yml` — Lint + type-check + test on PR
- [ ] Configure Vercel project + environment variables
- [ ] Set up Neon DB staging/production branches
- [ ] Configure MinIO bucket + access keys + CORS
- [ ] Domain setup + SSL
- [ ] Monitoring: Vercel Analytics + error tracking
- [ ] Final deployment verification
- [ ] Update README.md with setup instructions, architecture, contribution guide
