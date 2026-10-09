# AI-Marketplace — Frontend PRD (v2)

> **Status:** Draft v2 · **Updated:** October 2026
> **Framework change:** Vite + React → **Next.js 15 App Router**
> **Library additions:** Lenis · Animate UI · Aceternity UI *(replaces Inspira UI — Vue-only)*

---

## ⚠️ Library Compatibility Note

| Library | Framework | Status |
|---|---|---|
| [Lenis](https://github.com/darkroomengineering/lenis) | Framework-agnostic | ✅ Works with Next.js via `ReactLenis` wrapper |
| [Animate UI](https://animate-ui.com) | React + TypeScript + Tailwind CSS + Motion | ✅ Works with Next.js |
| [Aceternity UI](https://ui.aceternity.com) | React + Next.js + Tailwind CSS + Framer Motion | ✅ Works natively with Next.js |
| ~~Inspira UI~~ | **Vue / Nuxt only** | ❌ Not compatible with React/Next.js |

> Inspira UI was requested but is a Vue-exclusive library. It has been replaced with **Aceternity UI**, which offers an identical aesthetic (animated backgrounds, glowing cards, sparkles, beam effects) built natively for Next.js.

---

## 1. Overview

The AI-Marketplace is a platform where users browse, run, and manage AI agents. Each agent accepts a custom input schema and costs credits per run. This document defines every screen, component, animation, and API integration the Next.js frontend must deliver — using premium animation libraries for a world-class UX.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | **Next.js 15** (App Router, TypeScript) |
| **Styling** | **Tailwind CSS v3** (required by Animate UI + Aceternity UI) |
| **Smooth Scroll** | **Lenis** (`npm install lenis`) via `<ReactLenis root>` in root layout |
| **Animation Engine** | **Motion** (formerly Framer Motion) — underpins Animate UI |
| **UI Components** | **Animate UI** (shadcn CLI install) + **Aceternity UI** (copy-paste + shadcn CLI) |
| **HTTP Client** | **Axios** with interceptor for JWT refresh |
| **Server State** | **TanStack Query v5** (`@tanstack/react-query`) |
| **Auth State** | React Context + `useContext` |
| **Font** | **Inter** (Google Fonts via `next/font/google`) |
| **Icons** | **Lucide React** (+ Animate UI's animated icon variants) |

---

## 3. Library Setup

### 3.1 Lenis Smooth Scroll
```tsx
// app/layout.tsx
import { ReactLenis } from 'lenis/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
          {children}
        </ReactLenis>
      </body>
    </html>
  );
}
```
- Applies globally to every page
- Gives buttery-smooth inertia scrolling across the entire app
- On the Landing page, Lenis + Motion `useScroll` power parallax hero effects

### 3.2 Animate UI
- Install via shadcn CLI: `npx shadcn@latest add https://animate-ui.com/r/<component>`
- Components live in `components/animate-ui/` — fully owned code in your repo
- Requires Tailwind CSS + Motion

### 3.3 Aceternity UI
- Install via shadcn CLI or copy-paste from docs
- Requires Tailwind CSS + Motion + `cn()` utility
- Components live in `components/aceternity/`

---

## 4. User Roles

| Role | Permissions |
|---|---|
| `user` | Browse agents, run jobs, view own jobs, manage credits |
| `admin` | Everything above + create/edit/toggle agents, view all jobs and users |

Role is returned from the backend in the JWT payload (`user.role`).

---

## 5. Auth & Token Management

### 5.1 Storage
- `accessToken` → **memory** (React context, injected via Axios instance)
- `refreshToken` → **`localStorage`**

### 5.2 Axios Interceptor Flow
```
Every API Request
  └─ Attach Authorization: Bearer <accessToken>
     └─ If 401 received:
          ├─ Call POST /api/auth/refresh
          ├─ On success: update accessToken, retry original request
          └─ On failure: clear tokens, redirect to /login
```

### 5.3 Silent Refresh on App Load
```
App mounts
  └─ refreshToken in localStorage?
       ├─ YES → POST /api/auth/refresh → store new accessToken in context
       └─ NO  → user is unauthenticated, show public routes
```

---

## 6. Routes (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                  → / (Landing Page)
│   ├── login/page.tsx            → /login
│   └── register/page.tsx         → /register
├── (app)/
│   ├── layout.tsx                → Protected layout (auth check)
│   ├── dashboard/page.tsx        → /dashboard
│   ├── agents/
│   │   ├── page.tsx              → /agents (Marketplace)
│   │   └── [id]/page.tsx         → /agents/:id (Detail + Run)
│   ├── jobs/
│   │   ├── page.tsx              → /jobs (History)
│   │   └── [id]/page.tsx         → /jobs/:id (Detail)
│   └── credits/page.tsx          → /credits
└── (admin)/
    ├── layout.tsx                → Admin role check
    ├── admin/page.tsx            → /admin (Panel)
    ├── admin/agents/
    │   ├── new/page.tsx          → /admin/agents/new
    │   └── [id]/page.tsx         → /admin/agents/:id (Edit)
```

---

## 7. Screen Specifications & Library Usage

---

### 7.1 Landing Page (`/`)

**Purpose:** Convert visitors — this is the showpiece page for all three libraries.

**Sections & Components:**

| Section | Component Source | Details |
|---|---|---|
| **Hero** | Aceternity UI: `<BackgroundBeams>` + `<TypewriterEffect>` | Animated beam background, typewriter headline, CTA button with Animate UI `<RippleButton>` |
| **Animated Stats** | Animate UI: `<NumberTicker>` | "10,000+ jobs run", "50+ agents" counters animate on scroll into view |
| **Features Grid** | Aceternity UI: `<BentoGrid>` + `<BentoGridItem>` | 4 feature cards with icon, title, description — hover animates gradient border |
| **How It Works** | Animate UI: `<Motion>` step cards | 3-step horizontal stepper with staggered entrance animations |
| **Featured Agents** | Aceternity UI: `<Card3D>` / `<HoverEffect>` | 3 agent cards with 3D tilt on hover |
| **CTA Banner** | Aceternity UI: `<BackgroundGradient>` | Glowing gradient container around "Sign up free" CTA |
| **Footer** | Custom | Links, copyright |

**Lenis usage:** `useScroll` from Motion + Lenis for parallax translateY on hero background.

---

### 7.2 Login Page (`/login`)

**Form Fields:** Email, Password

**Components:**
- Aceternity UI `<BackgroundBeamsWithCollision>` — subtle animated background
- Animate UI `<AnimatedInput>` — inputs animate on focus
- Animate UI `<RippleButton>` — "Login" submit button
- Custom toast via Animate UI `<AnimatedToast>`

**API:** `POST /api/auth/login` → store tokens → redirect to `/dashboard`

**Error States:**
- `401` → toast "Invalid email or password"
- Zod client-side field validation

---

### 7.3 Register Page (`/register`)

**Form Fields:** Email, Password (min 8 chars), Confirm Password

**Components:** Same visual treatment as Login page — matching Aceternity UI background + Animate UI inputs

**API:** `POST /api/auth/register` → store tokens → redirect to `/dashboard`

**Error States:**
- `409 Conflict` → toast "Email already registered"
- Password mismatch → inline field error

---

### 7.4 User Dashboard (`/dashboard`)

**Purpose:** At-a-glance account summary.

**Widgets & Components:**

| Widget | Component | Details |
|---|---|---|
| **Credits Balance** | Animate UI `<NumberTicker>` | Animated count-up to balance on mount |
| **Recent Jobs** | Aceternity UI `<MovingBorder>` cards | Last 5 jobs, each in a card with glowing animated border; status badge using Animate UI `<AnimatedBadge>` |
| **Quick Actions** | Animate UI `<FlipButton>` | "Browse Agents" / "View Jobs" — card flips on hover reveal |
| **Usage Stats** | Animate UI `<ProgressBar>` | Animated success rate bar |
| **Background** | Aceternity UI `<Spotlight>` | Subtle directional spotlight on the page header area |

---

### 7.5 Agent Marketplace (`/agents`)

**Purpose:** Discover and browse all active AI agents.

**Layout & Components:**

| Element | Component | Details |
|---|---|---|
| **Page Header** | Animate UI `<TypingText>` | "Discover AI Agents" types out on mount |
| **Search Bar** | Animate UI `<AnimatedInput>` | Animated icon transition on focus |
| **Filter Chips** | Animate UI `<AnimatedTabs>` | Smooth sliding indicator on credit cost filter |
| **Agent Cards** | Aceternity UI `<HoverEffect>` card grid | Name, description, credit badge, "Run Agent" link; cards animate on hover with gradient spotlight |
| **Empty State** | Animate UI `<MotionDiv>` fade-in | Illustrated empty state with bounce animation |
| **Loading** | Aceternity UI `<Skeleton>` shimmer | Grid of 6 skeleton cards while fetching |

**API:** `GET /api/agents`

---

### 7.6 Agent Detail / Run Page (`/agents/:id`)

**Layout:** Two-column (agent info left, run form right)

**Components:**

| Element | Component | Details |
|---|---|---|
| **Agent Info Panel** | Aceternity UI `<BackgroundGradient>` card | Name, description, credit cost, creator info |
| **Credit Cost Warning** | Animate UI `<AnimatedAlert>` | Animated slide-in "This will cost X credits" |
| **Dynamic Form** | Custom `<DynamicForm>` | Renders fields from `agent.inputSchema.fields[]` using Animate UI `<AnimatedInput>`, `<AnimatedCheckbox>`, number inputs |
| **Submit Button** | Animate UI `<LiquidButton>` | Liquid fill animation on hover/click |
| **Success Toast** | Animate UI `<AnimatedToast>` | "Job submitted! ID: xxx" with link |
| **Background** | Aceternity UI `<GridAndDotBackgrounds>` | Subtle dot-grid pattern on the page |

**On Submit:** `POST /api/jobs` → show job ID + "Track Job" link → `/jobs/:id`

---

### 7.7 Job History (`/jobs`)

**Components:**

| Element | Component | Details |
|---|---|---|
| **Page Title** | Animate UI `<TypingText>` | |
| **Status Filter** | Animate UI `<AnimatedTabs>` | All / Pending / Processing / Completed / Failed |
| **Jobs Table** | Aceternity UI `<MovingBorder>` rows | Each job row has status `<AnimatedBadge>`, timestamps, "View" button |
| **Status Badge** | Custom `<StatusBadge>` | pending=yellow pulse, processing=blue spin, completed=green, failed=red |
| **Auto-refresh** | TanStack Query `refetchInterval` | Every 5s while any job is in `pending`/`processing` state |
| **Loading** | Animate UI shimmer skeleton rows | |

**API:** `GET /api/jobs`

---

### 7.8 Job Detail Page (`/jobs/:id`)

**Sections:**

| Section | Component | Details |
|---|---|---|
| **Job Metadata** | Aceternity UI `<CardSpotlight>` | Status, timestamps, duration inside a glowing card |
| **Input Payload** | Custom `<JsonViewer>` | Syntax-highlighted, collapsible JSON with Animate UI `<AnimatedCollapsible>` |
| **Output Result** | Custom `<JsonViewer>` | Shown only when `completed` — animate in with Motion fade+slide |
| **Error Message** | Animate UI `<AnimatedAlert variant="error">` | Shown only when `failed` |
| **Live Polling** | TanStack Query `refetchInterval: 3000` | Stops polling when status is terminal |
| **Pulsing Status** | Animate UI `<AnimatedBadge>` | `processing` badge has a continuous glow pulse |

---

### 7.9 Credits & Billing (`/credits`)

**Sections:**

| Section | Component | Details |
|---|---|---|
| **Balance Hero** | Animate UI `<NumberTicker>` in Aceternity `<CardSpotlight>` | Large animated credit count |
| **Top-Up Options** | Aceternity UI `<HoverEffect>` cards | 50 / 100 / 200 credit tier cards with hover glow |
| **Transaction Ledger** | Custom table | Date, reason, amount (green/red colored with Animate UI `<AnimatedBadge>`) |
| **Background** | Aceternity UI `<Spotlight>` | |

**API:** `GET /api/credits/balance` + `GET /api/credits/ledger`

---

### 7.10 Admin Panel (`/admin`)

**Access:** `admin` role only — redirect others to `/dashboard`

**Tabs:**
- Animate UI `<AnimatedTabs>` with sliding indicator

**Tab 1 — Agents:**
- Table of all agents (including inactive)
- Animate UI `<AnimatedSwitch>` for active toggle
- Actions: Edit → `/admin/agents/:id` | Delete (with Animate UI `<AnimatedDialog>` confirm)
- "Create New Agent" → Animate UI `<FlipButton>`

**Tab 2 — Jobs (All Users):**
- Table with user email, agent name, status, timestamps
- `<StatusBadge>` + Aceternity UI `<MovingBorder>` highlight on new rows

**Tab 3 — Users:**
- Email, role, credits balance, joined date

---

### 7.11 Create / Edit Agent (`/admin/agents/new` + `/admin/agents/:id`)

**Form Fields:**
- Agent Name, Description, System Prompt (large textarea)
- Credit Cost (number input)
- Is Active (Animate UI `<AnimatedSwitch>`)

**Input Schema Builder:**
- "Add Field" → Animate UI `<AnimatedDialog>` (Field Name, Type, Required)
- Fields list with Animate UI `<AnimatedCollapsible>` per field
- Remove field with Animate UI `<AnimatedBadge>` × button + list reorder animation

**API:** `POST /api/admin/agents` (create) / `PUT /api/admin/agents/:id` (edit)

---

## 8. Shared Components

| Component | Library/Source | Purpose |
|---|---|---|
| `Navbar` | Aceternity UI `<FloatingNav>` | Fixed floating navbar that hides on scroll down, appears on scroll up — powered by Lenis scroll position |
| `ProtectedLayout` | Next.js layout + middleware | Redirect unauthenticated users to `/login` |
| `AdminLayout` | Next.js layout | Redirect non-admin to `/dashboard` |
| `StatusBadge` | Custom + Animate UI `<AnimatedBadge>` | Colored pill for job status |
| `CreditChip` | Custom | ⚡ credit count in Navbar |
| `DynamicForm` | Custom | Renders agent input fields from JSON schema |
| `JsonViewer` | Custom | Syntax-highlighted JSON with Animate UI collapse |
| `Toast` | Animate UI `<AnimatedToast>` | Global success/error/info toasts |
| `Modal` | Animate UI `<AnimatedDialog>` | Accessible animated modals |
| `Skeleton` | Aceternity UI Skeleton | Loading placeholder shimmer |
| `EmptyState` | Custom + Motion fade | Illustrated empty state with bounce |
| `Pagination` | Custom + Animate UI page transitions | |

---

## 9. Aceternity UI Component Map

Key Aceternity UI components and where they're used:

| Component | Pages Used |
|---|---|
| `<BackgroundBeams>` | Landing Hero, Login, Register |
| `<BackgroundGradient>` | Landing CTA, Agent Detail info panel |
| `<BentoGrid>` + `<BentoGridItem>` | Landing Features section |
| `<HoverEffect>` | Agent Marketplace cards, Credits top-up tiers |
| `<CardSpotlight>` | Job Detail metadata, Credits balance |
| `<MovingBorder>` | Dashboard job cards, Job History rows |
| `<Spotlight>` | Dashboard header, Credits page |
| `<FloatingNav>` | Global Navbar |
| `<TypewriterEffect>` | Landing Hero headline |
| `<GridAndDotBackgrounds>` | Agent Detail page |
| `<Card3D>` / `<3DCard>` | Landing Featured Agents |
| `<Skeleton>` | All loading states |

---

## 10. Animate UI Component Map

Key Animate UI components and where they're used:

| Component | Pages Used |
|---|---|
| `<TypingText>` | Marketplace page title, Job History title |
| `<NumberTicker>` | Dashboard credits widget, Landing stats |
| `<AnimatedInput>` | Login, Register, Marketplace search, Agent run form |
| `<AnimatedTabs>` | Marketplace filter, Job History filter, Admin tabs |
| `<AnimatedBadge>` | Status badges across all job views |
| `<AnimatedDialog>` | Admin confirm delete, Schema field builder |
| `<AnimatedAlert>` | Credit cost warning, error messages |
| `<AnimatedSwitch>` | Admin agent active toggle |
| `<AnimatedCollapsible>` | JSON viewer, Schema field list |
| `<AnimatedToast>` | Global notification system |
| `<RippleButton>` | Login, Register submit buttons |
| `<LiquidButton>` | Agent "Run" submit button |
| `<FlipButton>` | Dashboard quick actions |
| `<AnimatedProgressBar>` | Dashboard usage stats |
| `<MotionCarousel>` | Landing "How It Works" steps |
| `<GravityStarsBackground>` | Landing hero background accent |

---

## 11. Lenis Scroll Integration Map

| Page / Feature | Lenis Usage |
|---|---|
| **Root Layout** | `<ReactLenis root>` wraps entire app — global smooth scroll |
| **Landing Hero** | `useScroll` + `useTransform` from Motion in sync with Lenis for parallax translateY on the background |
| **Features Section** | Animate-on-scroll using Motion `whileInView` — Lenis ensures smooth trigger timing |
| **Navbar** | Reads scroll position via `useLenis` hook to toggle floating nav visibility |
| **Agent Marketplace** | Infinite scroll load trigger synced with Lenis scroll events |
| **Job History** | Same infinite scroll pattern |

---

## 12. Design System

### 12.1 Color Palette

```css
:root {
  --color-bg-primary: #020210;
  --color-bg-surface: #0d0d1a;
  --color-bg-elevated: #13132b;
  --color-accent: #7c6af7;
  --color-accent-glow: rgba(124, 106, 247, 0.3);
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #38bdf8;
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #a0a0b8;
  --color-border: rgba(255, 255, 255, 0.07);
}
```

### 12.2 Typography
- Font: **Inter** via `next/font/google`
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64px

### 12.3 Tailwind Config Additions
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      accent: '#7c6af7',
      'accent-glow': 'rgba(124, 106, 247, 0.3)',
    },
    animation: {
      'gradient-x': 'gradient-x 3s ease infinite',
      'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    },
  }
}
```

### 12.4 Motion Defaults
All page transitions: `opacity: 0 → 1`, `y: 20 → 0`, duration 0.4s, ease `easeOut`

---

## 13. Auth State Machine

```
App Mount (layout.tsx)
  └─ Check localStorage for refreshToken
       ├─ Found → POST /api/auth/refresh
       │    ├─ 200 OK → store accessToken in AuthContext → render (app) layout
       │    └─ 401 → clear tokens → redirect /login
       └─ Not found → user is guest → render (public) layout

Login / Register → success
  └─ Store accessToken (memory) + refreshToken (localStorage)
     └─ router.push('/dashboard')

Logout (Navbar)
  └─ POST /api/auth/logout
     └─ Clear AuthContext + localStorage → router.push('/login')

401 on any API call
  └─ Axios interceptor: refresh → retry once → success or logout
```

---

## 14. API Endpoints Frontend Consumes

### Already Implemented
| Method | Endpoint | Page |
|---|---|---|
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Axios interceptor |
| `POST` | `/api/auth/logout` | Navbar |

### To Be Implemented (Backend)
| Method | Endpoint | Page |
|---|---|---|
| `GET` | `/api/agents` | Marketplace |
| `GET` | `/api/agents/:id` | Agent Detail |
| `POST` | `/api/jobs` | Agent Run form |
| `GET` | `/api/jobs` | Job History |
| `GET` | `/api/jobs/:id` | Job Detail |
| `GET` | `/api/credits/balance` | Dashboard, Credits |
| `GET` | `/api/credits/ledger` | Credits page |
| `POST` | `/api/admin/agents` | Create Agent |
| `PUT` | `/api/admin/agents/:id` | Edit Agent |
| `DELETE` | `/api/admin/agents/:id` | Admin Panel |
| `PATCH` | `/api/admin/agents/:id/toggle` | Admin agent toggle |
| `GET` | `/api/admin/jobs` | Admin Jobs tab |
| `GET` | `/api/admin/users` | Admin Users tab |

---

## 15. Implementation Phases

### Phase 1 — Scaffold & Foundation
- [ ] `npx create-next-app@latest ./client --typescript --tailwind --app`
- [ ] Install: `lenis`, `motion`, `axios`, `@tanstack/react-query`, `lucide-react`
- [ ] Configure `next/font/google` (Inter)
- [ ] Set up Tailwind config with custom colors and animations
- [ ] Add `<ReactLenis root>` to `app/layout.tsx`
- [ ] Create `lib/axios.ts` with JWT interceptor
- [ ] Create `contexts/AuthContext.tsx` with `useAuth` hook
- [ ] Set up route groups: `(public)`, `(app)`, `(admin)`

### Phase 2 — Auth Flows
- [ ] Landing Page (all sections with Aceternity + Animate UI)
- [ ] Login Page (Aceternity background + Animate UI form)
- [ ] Register Page (same treatment)
- [ ] Silent refresh logic in root layout

### Phase 3 — Core User Flows
- [ ] Install all Aceternity UI and Animate UI components needed
- [ ] `<FloatingNav>` Navbar component (Lenis scroll-aware)
- [ ] Agent Marketplace with `<HoverEffect>` cards
- [ ] Agent Detail page with Dynamic Form + `<LiquidButton>`
- [ ] Job History table with polling
- [ ] Job Detail page with `<JsonViewer>` + polling
- [ ] Dashboard widgets with `<NumberTicker>` + `<MovingBorder>`

### Phase 4 — Credits
- [ ] Credits balance page with `<NumberTicker>` + `<CardSpotlight>`
- [ ] Ledger table with colored amount badges
- [ ] Mock top-up cards with `<HoverEffect>`

### Phase 5 — Admin Panel
- [ ] Admin layout with role guard middleware
- [ ] `<AnimatedTabs>` for Agents / Jobs / Users tabs
- [ ] Agent table with `<AnimatedSwitch>` and `<AnimatedDialog>` confirm delete
- [ ] Create/Edit Agent form with Schema Builder using `<AnimatedDialog>` + `<AnimatedCollapsible>`

### Phase 6 — Polish
- [ ] Error boundaries with Aceternity animated 404/500 screens
- [ ] Full empty states for all list pages
- [ ] Responsive/mobile layout review
- [ ] `prefers-reduced-motion` respect for all Motion animations
- [ ] Accessibility audit (ARIA, keyboard nav, focus rings)
- [ ] Next.js `<Image>` optimization and Metadata/SEO for all pages

---

## 16. Out of Scope (v1)

- Payment gateway (credits are mock top-up)
- Real-time WebSocket (polling is sufficient for v1)
- OAuth / social login
- Full-text search on agents (client-side filter only)
- Email verification / password reset
- Dark/light mode toggle (dark-only for v1)
