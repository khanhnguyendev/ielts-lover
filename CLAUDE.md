# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Next.js)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

There is no test runner configured. Linting is the only automated check.

## Architecture

Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json`).

Strict three-layer architecture — enforce this at all times:

```
app/          → UI Layer: render + call Server Actions only. No DB or AI logic.
services/     → Business Logic: AI orchestration, scoring, credit rules, attempt lifecycle.
repositories/ → Data Access: pure Supabase/SQL queries. No AI calls.
```

**No exceptions.** Business logic outside `services/` is a violation. Direct DB access from `app/` is a violation.

### Server Actions

Centralized in a few files — do not scatter `"use server"` across components:
- `app/actions.ts` — Primary user-facing actions (exercises, attempts, feedback)
- `app/admin/actions.ts` — Admin-only actions
- `app/dashboard/credits/actions.ts` — Credit management
- `app/notification-actions.ts` — Notification operations
- `app/teacher/actions.ts` — Teacher-specific actions

Every action that does meaningful work must be wrapped with `traceAction()` for observability.

### Key Services
- `ai.service.ts` — All AI calls (Gemini via `@google/generative-ai`). Prompts are versioned and return JSON. Every AI response must be stored in the `reports` table.
- `attempt.service.ts` — Attempt lifecycle and scoring.
- `credit.service.ts` — StarCredits economy. Throws `InsufficientFundsError` / `MonthlyLimitError`. Daily grant is lazy (triggered by `ensureDailyGrant()` on billing, not a cron).
- `improvement.service.ts` — Sentence-level feedback.
- `ai-cost.service.ts` — AI usage tracking. Record costs non-blocking via `recordAICost()` (fire-and-forget, never await in the action's critical path).
- `notification.service.ts` — Creates DB records + increments Redis unread counter (dual Redis+Postgres strategy with 24h TTL).
- `storage.service.ts` — Cloudinary file uploads for exercise images and AI-generated charts.
- `admin.policy.ts` — Authorization role checks (`canAccessAdmin`, `canAccessTeacher`, `canManageCreditsDirectly`, `canCreateExercises`). Not credit rules.

### Observability

- `traceAction(name, fn)` — Wraps server actions with `AsyncLocalStorage` trace context (UUID).
- `traceService(instance)` — Wraps repository/service classes with Proxy for automatic method call logging.
- `withTrace(fn)` — Runs code within a trace context. Trace IDs propagate through the call stack.
- Structured logger at `lib/logger.ts`; respects `LOG_LEVEL` env var.
- Sentry is integrated (`instrumentation.ts`); 10% trace sampling in prod, 100% in dev.

### Background Jobs (Inngest)

Inngest handles async work. Client at `inngest/client.ts`, functions in `inngest/functions/`.

- **Single API route**: `app/api/inngest/route.ts` — the only API route in the app.
- **`evaluateAttemptBackground`** — triggered by `"attempt/evaluate"` event. Runs AI evaluation, records cost, notifies user. Retries: 2, concurrency: 10. Creates its own isolated service instances per invocation (does not reuse module-level singletons).
- `submitAttempt` in `app/actions.ts` currently evaluates **synchronously** with a distributed lock. The Inngest path is available for background/async evaluation.

### Redis Infrastructure

Redis (`@upstash/redis`) is **optional** — the app degrades gracefully when not configured.

- `lib/redis.ts` — Client singleton; exports `hasRedis` boolean.
- `lib/ratelimit.ts` — Per-user rate limiting on AI actions. Fail-closed (denies requests if Redis unavailable). Check rate limit before deducting credits.
- `lib/distributed-lock.ts` — `acquireLock()` / `withLock()` using `SET NX` with TTL. Used in `submitAttempt` and `reevaluateAttempt` to prevent concurrent billing. Fail-open (skips lock if Redis unavailable).
- `lib/maintenance.ts` — Redis-backed maintenance mode toggle. Fail-open (allows traffic if Redis unavailable). Checked in middleware for every non-admin, non-`/maintenance` request.

### Data Immutability
- `exercises` are versioned and immutable once published.
- `attempts` and `reports` are historical records — never edit them.

## Credit Economy (Client-Side)

Every client action that deducts credits **must** dispatch a `CustomEvent` for optimistic UI updates in `StarsBalance.tsx`:

```ts
// Before server action (optimistic deduction)
window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -cost } }));

// On failure (compensatory refund)
window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: cost } }));
```

## Constants — No Magic Strings

Never hardcode system flags, statuses, types, or roles as string literals. Always use `@/lib/constants.ts`.

```ts
// ❌ Bad
if (status === 'submitted') { ... }
if (role === 'admin') { ... }

// ✅ Good
if (status === ATTEMPT_STATES.SUBMITTED) { ... }
if (role === USER_ROLES.ADMIN) { ... }
```

If a constant doesn't exist yet, add it to `@/lib/constants.ts` first, then import it.

UI toast messages live in `@/lib/constants/messages.ts` (exported as `NOTIFY_MSGS`).

When validating with Zod: `z.enum(Object.values(TRANSACTION_TYPES) as [string, ...string[]])`

## Notification Rules

Every server action that changes state visible to a user **must** send a push notification. Use the `notifyAIComplete()` helper in `app/actions.ts` for AI actions, or call `notificationService.notify()` directly for other actions.

**Must notify:**
- All AI actions on completion (use `notifyAIComplete()`)
- Credit changes affecting a user (grants, adjustments, refunds from admin)
- Role changes, teacher/student assignments
- Credit request status changes (approved/rejected → teacher + student)

**Do NOT notify:**
- Admin-only CRUD (exercises, lessons, packages, settings, model pricing)
- System config changes (maintenance mode, feature pricing)
- User's own self-initiated mutations (save draft, update profile, login)
- Read-only queries

```ts
// ✅ AI action — one-liner helper
notifyAIComplete(user.id, "Title", "Body", "/deep/link", entityId);

// ✅ Admin action affecting a user
notificationService.notify(
    userId,
    NOTIFICATION_TYPES.CREDITS_RECEIVED,
    "Credits Received",
    `You received ${amount} credits.`,
    { deepLink: "/dashboard", entityType: NOTIFICATION_ENTITY_TYPES.CREDIT_TRANSACTION }
).catch(err => logger.error("Notification failed (non-blocking)", { error: err }));
```

Notifications are always **fire-and-forget** — never await them in the action's critical path. Always `.catch()` to prevent notification failures from breaking the action.

## Admin Console Rules

- Admin actions must be auditable, reversible, and support draft flow.
- AI-generated exercises require human approval before publishing.
- **Page titles**: Managed centrally by `AdminDynamicTitle` in the global `Header`. Do **not** render `<h1>` or similar page-name headers inside individual admin pages.

## UI Conventions

- **Component filenames**: kebab-case (`user-profile-menu.tsx`)
- **Shadcn UI**: Use base components from `components/ui`; extend via props/variants. Don't create parallel components (`Button2.tsx`, `CustomInput.tsx`).
- **Zustand**: Only for ephemeral UI state (sidebar toggles, active practice state).
- **Tailwind**: Mobile-first. Use CSS variable-based semantic tokens (`bg-background`, `text-foreground`, `border-border`), not raw color classes.
- Before creating any new component, check `components/ui` and `components/` for an 80%+ match to extend instead.

### Liquid Glass Aesthetic

- Use `.glass-card` for container-level elements with `backdrop-blur-3xl` or `backdrop-blur-2xl`.
- Translucency: `bg-white/40` (Light), `bg-slate-900/40` (Dark). Borders: `border-white/20` / `border-white/10`.
- Aggressive rounding: `rounded-[2.5rem]` for sections/cards, `rounded-2xl` for components.
- Depth blobs: absolute-positioned `bg-primary/5 rounded-full blur-[120px]`.

### Interaction Patterns

- **Premium cards**: `whileHover={{ y: -8 }}` + `shadow-2xl`. Scale icons `1.1`, rotate `6deg`.
- **List items/rows**: `hover:bg-primary/[0.04]`, `active:scale-[0.99]`.
- **Action buttons**: `hover:scale-105`, `active:scale-95`.
- **Transitions**: `duration-500` for large surface changes; `duration-300` for micro-interactions.

### Typography

- Headings: `font-black` (`800+`) with `tracking-tight`. Use `font-outfit` for premium emphasis.
- Action labels: `text-[10px] font-black uppercase tracking-[0.2em]`.

### Spacing

Follow the **8px grid** strictly (`p-8`, `gap-4`). See `globals.css` for automated scaling on small laptops (1024px–1440px).

### Mandatory Utility Functions

- **Date/Time**: Always use `formatDate(date, includeYear?)`, `formatTime(date)`, or `formatDateTime(date)` from `@/lib/utils`. Never use raw `.toLocaleDateString()` etc.
- **Credits**: Always use `formatCredits(amount)` from `@/lib/utils` for balances (compact notation like `1.5k`).

### Credit Display Components (Reuse)

- **Header/Balance**: `<StarsBalance balance={amount} />` — includes auto-sync and update animations.
- **Transaction/Inline**: `<CreditBadge amount={amount} size="sm|md|lg" />` — for costs or rewards.

## Git Commit Convention

Format: `<type>(<scope>): <emoji> <subject>`

| Type | Emoji |
|------|-------|
| feat | ✨ |
| fix | 🐛 |
| ui | 💄 |
| refactor | ♻️ |
| perf | ⚡️ |
| docs | 📚 |
| test | ✅ |
| chore | 🔧 |
| wip | 🚧 |

- Subject: imperative mood, lowercase, no trailing period, max 70 chars.
- Examples: `feat(auth): ✨ add google login provider`, `fix(navbar): 🐛 resolve layout shift on mobile`

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
GEMINI_API_KEY
GEMINI_MODEL                    # gemini-flash-lite-latest
CLOUDINARY_URL
NEXT_PUBLIC_APP_URL
UPSTASH_REDIS_REST_URL          # Optional — Redis for rate limiting, locks, maintenance mode
UPSTASH_REDIS_REST_TOKEN        # Optional — required if UPSTASH_REDIS_REST_URL is set
```

Supabase has two server clients (`lib/supabase/server.ts`): a user-scoped client (respects RLS) and a service-role client (bypasses RLS, for admin operations only).

## Database

Schema name: `ielts_lover_v1`. Migrations are in `supabase/migrations/`.

Auth flow: Supabase email/password → callback at `/auth/callback` → session via cookies. Route protection is in `src/proxy.ts` (Next.js middleware).

### Route Protection (`proxy.ts`)

- **Public routes**: `/`, `/login`, `/signup`, `/onboarding`, `/auth/callback`, `/maintenance`
- **Guest-browsable**: most `/dashboard/*` sub-routes (exercises, lessons, samples)
- **Auth-required**: `/dashboard/settings`, `/dashboard/credits`, `/dashboard/transactions`, `/dashboard/improvement`, `/dashboard/reports`, `/dashboard/speaking`, `/admin/*`, `/teacher/*`
- Authenticated users hitting `/login` or `/signup` are redirected to `/dashboard`
- Maintenance mode redirects all non-admin users to `/maintenance` (admins bypass)
