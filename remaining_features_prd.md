# Product Requirements Document (PRD): AI-Marketplace â€” Remaining Features & Production Hardening (v3)

**Document Status:** Approved for Implementation  
**Target Release:** v3.0  
**Scope:** Completion of incomplete modules, production reliability fixes, user execution workflows, administrative controls, and marketplace growth features.  
**Related Documents:** [frontend_prd.md](file:///d:/MarketPlace/AI-Marketplace/frontend_prd.md), [design.md](file:///d:/MarketPlace/AI-Marketplace/design.md)

---

## 1. Executive Summary & Goals

The AI-Marketplace platform enables users to discover, run, and pay for autonomous AI agents powered by Google Gemini and queued via BullMQ. While the core orchestration and UI flows (Next.js 15, Drizzle ORM, Express, Razorpay frontend verification) are operational, several critical system gaps, disconnected real-time components, administrative blindspots, and missing execution capabilities prevent production readiness.

### Key Objectives
1. **Payment Reliability (P0):** Ensure zero lost transactions through automated server-to-server Razorpay webhooks with cryptographic HMAC verification.
2. **True Real-Time Job UX (P0):** Replace client HTTP polling on `/jobs/:id` with the already implemented WebSocket/Redis PubSub infrastructure.
3. **Execution Control & Convenience (P1):** Provide 1-click job retry, input prefilling, and cancellation of in-flight jobs.
4. **Platform Scalability (P1):** Transition from unbounded memory arrays to database-level pagination, search, and category indexing.
5. **Operational Administration (P2):** Empower admins to manually adjust user credit balances, manage user accounts, and resolve support requests.
6. **Authentication Completeness (P2):** Implement self-service password reset and profile customization.
7. **Marketplace Maturity (P3):** Introduce agent ratings/reviews, file-attachment schema inputs, and token-streaming outputs.

---

## 2. Feature Priority Matrix

| Feature ID | Feature Name | Priority | Target Release | Complexity | Business / Tech Impact |
|---|---|---|---|---|---|
| **PAY-01** | Razorpay Webhook & Async Credit Fulfillment | **P0** | Sprint 1 | Medium | Eliminates lost credits upon browser drop or closed checkout |
| **RT-01** | WebSocket Telemetry on `/jobs/[id]` & Toast Sync | **P0** | Sprint 1 | Low | Reduces DB polling load by 95%; eliminates latency |
| **CLN-01** | Deprecate Legacy `/marketplace/*` Stubs | **P0** | Sprint 1 | Low | Cleans routing ambiguity and prevents stale link indexing |
| **JOB-01** | Job Re-Run, Retry & In-Flight Cancellation | **P1** | Sprint 2 | Medium | High user retention; eliminates manual retyping of prompts |
| **SCL-01** | Backend Pagination, Filtering & Search | **P1** | Sprint 2 | Medium | Prevents server memory exhaustion as job history scales |
| **EXP-01** | Job Result Export (Markdown, JSON, Copy) | **P1** | Sprint 2 | Low | High utility for developer and business users |
| **ADM-01** | Admin Credit Grant/Deduct Ledger Action | **P2** | Sprint 3 | Low | Vital for support, disputes, promotional bonuses |
| **ADM-02** | User Management (Status Toggle & Role Switch) | **P2** | Sprint 3 | Medium | Security control for abuse prevention |
| **AUTH-01**| Forgot Password / Password Reset via Email | **P2** | Sprint 3 | High | Eliminates locked-out user churn |
| **AUTH-02**| User Profile Customization (Name, Avatar) | **P2** | Sprint 3 | Low | Personalizes dashboard experience |
| **MKT-01** | Agent Reviews, Ratings (1â€“5 Stars) & Feedback | **P3** | Sprint 4 | Medium | Social proof and marketplace quality signaling |
| **MKT-02** | Multimodal File Inputs in Schema (PDF / Image) | **P3** | Sprint 4 | High | Enables doc summarizer and visual inspection agents |
| **MKT-03** | Token-by-Token Streaming Output | **P3** | Sprint 4 | High | Vastly improves perceived generation speed |

---

## 3. Detailed Feature Specifications

---

### Phase 1 (P0): Critical Payment Reliability & Real-Time Sync

#### PAY-01: Razorpay Webhook & Async Credit Fulfillment
* **Problem:** Currently, credits are only deposited if the user's browser successfully executes `verifyCreditPayment()` in `credits/page.tsx`. If the user closes the payment tab, loses internet connectivity, or experiences a client crash after completing payment, the user is charged by Razorpay but receives zero credits.
* **Specification:**
  1. Add a public, unauthenticated webhook endpoint: `POST /api/credits/webhook`.
  2. Implement Razorpay cryptographic HMAC SHA-256 signature verification using `req.headers['x-razorpay-signature']` and `process.env.RAZORPAY_WEBHOOK_SECRET`.
  3. Support event `order.paid` and `payment.captured`.
  4. Parse the `notes.credits` and metadata associated with the order.
  5. Check `creditsLedger` for idempotency using `referenceId` (e.g., `razorpay_payment_id` or `order_id`). If already credited, respond `200 OK` immediately without duplicate crediting.
  6. Insert ledger record `{ userId, amount: credits, reason: "topup", referenceId: paymentId }`.
  7. Publish a real-time WebSocket event to the user's channel updating their credit balance in real time.
* **Acceptance Criteria:**
  * Dropped frontend requests do not result in uncredited payments.
  * Replayed webhook events from Razorpay do not double-credit accounts.
  * Requests with invalid signatures return `400 Bad Request`.

#### RT-01: Connect WebSocket Telemetry to `/jobs/[id]` & Global Toasts
* **Problem:** The server initializes a WebSocket server with Redis PubSub (`server/src/lib/websocket.ts`). The frontend also has `client/src/hooks/useJobStatus.ts`, yet `client/src/app/jobs/[id]/page.tsx` ignores it and runs `setInterval` polling every 2,500ms.
* **Specification:**
  1. Refactor `client/src/app/jobs/[id]/page.tsx` to consume `useJobStatus(jobId)`.
  2. Maintain HTTP polling strictly as an automatic fallback if the WebSocket disconnects or fails to establish.
  3. When status transitions to `completed` or `failed`, render results instantly without waiting for the next polling tick.
  4. Integrate global WebSocket listener into the application root layout (`Providers.tsx` or `Navbar.tsx`):
     * When any background job completes or fails for the authenticated user while they are on another screen, render a notification toast linking to `/jobs/:id`.
* **Acceptance Criteria:**
  * Terminal statuses update on screen in `< 300ms` from worker completion.
  * Disconnecting WebSocket transparently falls back to 3-second HTTP polling.

#### CLN-01: Deprecate Legacy `/marketplace/*` Route Stubs
* **Problem:** Files under `client/src/app/marketplace/*` (`run/[agentId]`, `jobs/[jobId]`, `marketplace/page.tsx`) are legacy redirect stubs from an earlier structural redesign.
* **Specification:**
  1. Add permanent `308 Permanent Redirect` rules in `client/next.config.ts` for:
     * `/marketplace` â†’ `/agents`
     * `/marketplace/run/:agentId` â†’ `/agents/:agentId`
     * `/marketplace/jobs/:jobId` â†’ `/jobs/:jobId`
  2. Delete legacy stub folders from `client/src/app/marketplace/` to clean the codebase and avoid build confusion.

---

### Phase 2 (P1): Core Execution UX & Operational Scalability

#### JOB-01: Job Re-Run, Retry & In-Flight Cancellation
* **Specification:**
  1. **Job Cancellation:**
     * Endpoint: `POST /api/jobs/:id/cancel` (Auth required, ownership checked).
     * If job status is `pending`: remove job from BullMQ queue, set status to `failed`, errorMessage `"Cancelled by user"`, and immediately refund agent credits to `creditsLedger`.
     * If job status is `processing`: terminate or discard worker output, issue credit refund, set status to `failed`.
  2. **Job Retry / Re-Run:**
     * On `/jobs/[id]` page, display:
       * **"Re-run with same inputs"** button: Opens `/agents/[agentId]` with prefilled form values from `job.inputPayload`.
       * **"Retry Job"** button (for `failed` jobs): Submits a fresh `POST /api/jobs` call with the exact same payload in 1 click after verifying credit balance.
* **Acceptance Criteria:**
  * Cancelling a pending job removes it from the queue and restores credits within 1 database transaction.
  * Users can re-run previous inputs with zero manual copy-pasting.

#### SCL-01: Server-Side Pagination, Filtering & Search
* **Specification:**
  1. **Jobs API (`GET /api/jobs`):**
     * Query parameters: `page` (default 1), `limit` (default 15, max 50), `status` (optional), `agentId` (optional).
     * Response: `{ data: Job[], pagination: { total, page, limit, totalPages } }`.
  2. **Agents API (`GET /api/agents`):**
     * Query parameters: `category` (optional), `search` (optional ILIKE on name/description), `isActive` (boolean).
  3. **Admin APIs (`GET /api/admin/jobs`, `GET /api/admin/users`):**
     * Standardized page/limit query parameters and database-level `OFFSET`/`LIMIT` with total count.
  4. **Frontend Updates:**
     * Implement responsive pagination controls on `/jobs`, `/admin`, and `/agents`.
* **Acceptance Criteria:**
  * Listing pages load within `< 100ms` regardless of database row volume.

#### EXP-01: Job Result Export Engine
* **Specification:**
  1. On `/jobs/[id]`, add an "Export Result" dropdown with options:
     * **Download Markdown (`.md`):** Formats title, metadata, inputs, and output text into a clean markdown document.
     * **Download JSON (`.json`):** Full telemetry payload including runtime duration, timestamps, input parameters, and structured output.
     * **Copy Formatted Text:** Raw output copied to clipboard with animated confirmation badge.

---

### Phase 3 (P2): Admin Operations & Authentication Completeness

#### ADM-01: Admin Manual Credit Adjustments
* **Specification:**
  1. Endpoint: `POST /api/admin/users/:id/credits` (Requires `admin` role).
  2. Body: `{ amount: number, reason: string }` (e.g., `+50` for support compensation, `-20` for correction).
  3. Action: Validate user existence, insert entry into `creditsLedger`, log admin action in structured audit logger.
  4. UI in `/admin`: Add a "Manage Credits" modal on each user row allowing admins to view ledger and credit/debit balances with a custom memo.

#### ADM-02: User Management Controls (Suspension & Role Promotion)
* **Specification:**
  1. Extend `users` table with `isSuspended: boolean` (default `false`).
  2. Endpoints:
     * `PATCH /api/admin/users/:id/status` â†’ toggle `isSuspended`.
     * `PATCH /api/admin/users/:id/role` â†’ promote/demote between `user` and `admin`.
  3. Middleware check: If user `isSuspended === true`, block all requests with `403 Forbidden ("Account is suspended")`.

#### AUTH-01: Forgot Password / Password Reset Flow
* **Specification:**
  1. Add table `password_reset_tokens`:
     * `id: uuid`, `userId: uuid`, `tokenHash: text`, `expiresAt: timestamp`, `usedAt: timestamp`.
  2. Endpoint: `POST /api/auth/forgot-password`
     * Accepts `{ email }`. If email exists, generate secure 32-byte crypto token (1-hour expiry) and trigger email.
  3. Endpoint: `POST /api/auth/reset-password`
     * Accepts `{ token, newPassword }`. Validates unexpired, unused token; hashes password; invalidates current refresh tokens; updates password.
  4. Frontend Pages:
     * `/forgot-password` (enter email)
     * `/reset-password?token=XYZ` (enter and confirm new password)

#### AUTH-02: User Profile Customization
* **Specification:**
  1. Extend `users` table:
     * `name: varchar(255)`, `avatarUrl: text`.
  2. Endpoint: `PUT /api/auth/profile` allowing users to update their display name and avatar selection.
  3. Display custom user name and initials/avatar across the Navbar and Dashboard.

---

### Phase 4 (P3): Marketplace Evolution & Advanced Capabilities

#### MKT-01: Agent Reviews, Ratings (1â€“5 Stars) & Feedback
* **Specification:**
  1. Add table `agent_reviews`:
     * `id: uuid`, `agentId: uuid`, `userId: uuid`, `rating: integer (1-5)`, `comment: text`, `createdAt: timestamp`.
  2. Endpoints:
     * `POST /api/agents/:id/reviews` (Only allowed if user has completed â‰¥1 job with this agent).
     * `GET /api/agents/:id/reviews` (Paginated list of reviews with average rating score).
  3. UI:
     * Star rating badge and count on `AgentCard.tsx` and `/agents/[id]`.
     * Review submission form and feedback drawer on completed job pages.

#### MKT-02: Multimodal & File Upload Inputs in Agent Schema
* **Specification:**
  1. Extend schema field types to include `"file"` (accepting mime types e.g. `image/png`, `application/pdf`, `text/csv`).
  2. Implement pre-signed URL upload or secure upload endpoint (`POST /api/uploads`) storing assets in cloud storage (S3 / Cloudflare R2).
  3. In `agentWorker.ts`: Pass image/document parts into Google Gemini Multimodal Content API (`inlineData` or `fileData`).

#### MKT-03: Real-Time Token Streaming Output
* **Specification:**
  1. Refactor Gemini invocation in `agentWorker.ts` / server to support `model.generateContentStream()`.
  2. Stream chunk tokens over the existing WebSocket connection directly to the client's `useJobStatus` listener.
  3. Render streaming output on `/jobs/[id]` using animated markdown typing effect.

---

## 4. Database Schema Migrations (Drizzle ORM)

The following schema modifications are required in `server/src/db/schema.ts`:

```typescript
// 1. Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. Agent reviews & ratings table
export const agentReviews = pgTable("agent_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. Columns to append to 'users' table
// - name: varchar("name", { length: 255 })
// - avatarUrl: text("avatar_url")
// - isSuspended: boolean("is_suspended").notNull().default(false)

// 4. Columns to append to 'creditsLedger' table
// - referenceId: varchar("reference_id", { length: 255 }).unique() // Idempotency key for Razorpay payment/order IDs
```

---

## 5. API Endpoints Specification

### New & Updated Endpoints Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/credits/webhook` | None (HMAC Header) | Razorpay payment webhook listener for async credit top-ups |
| `POST` | `/api/jobs/:id/cancel` | Bearer Token | Cancels pending/processing job and restores credits |
| `POST` | `/api/jobs/:id/retry` | Bearer Token | Re-runs existing job input payload as a fresh job |
| `GET` | `/api/jobs` | Bearer Token | Paginated user job history (`?page=1&limit=15&status=...`) |
| `POST` | `/api/admin/users/:id/credits`| Admin Bearer | Manually grants or debits user credits |
| `PATCH`| `/api/admin/users/:id/status` | Admin Bearer | Suspends or unsuspends user account |
| `PATCH`| `/api/admin/users/:id/role` | Admin Bearer | Updates user role (`user` â†” `admin`) |
| `POST` | `/api/auth/forgot-password` | None | Initiates password reset email flow |
| `POST` | `/api/auth/reset-password` | None | Completes password reset with secure token |
| `POST` | `/api/agents/:id/reviews` | Bearer Token | Submits rating & review for an agent |
| `GET` | `/api/agents/:id/reviews` | None | Retrieves reviews and rating aggregation for agent |

---

## 6. Implementation Milestones & Roadmap

```mermaid
flowchart TD
    subgraph Sprint 1: P0 Critical
        A1[Razorpay Webhook Endpoint] --> A2[Idempotent Credit Deposits]
        A3[Wire WebSocket to jobs/id Page] --> A4[Global Job Notification Toast]
        A5[Delete Legacy /marketplace Stubs]
    end

    subgraph Sprint 2: P1 Execution & Scale
        B1[Job Cancellation & Auto-Refund] --> B2[1-Click Job Retry / Re-Run]
        B3[Server-Side Pagination on Jobs & Admin] --> B4[Export Result to MD/JSON]
    end

    subgraph Sprint 3: P2 Admin & Auth
        C1[Admin Credit Grant/Deduct Modal] --> C2[User Suspend/Role Management]
        C3[Forgot Password Token System & Email] --> C4[User Profile Display Name/Avatar]
    end

    subgraph Sprint 4: P3 Marketplace Expansion
        D1[Agent 1-5 Star Reviews & Schema] --> D2[Multimodal File Attachment Uploads]
        D3[Gemini Token Output Streaming]
    end

    Sprint 1: P0 Critical --> Sprint 2: P1 Execution & Scale
    Sprint 2: P1 Execution & Scale --> Sprint 3: P2 Admin & Auth
    Sprint 3: P2 Admin & Auth --> Sprint 4: P3 Marketplace Expansion
```

---

## 7. Non-Functional & Security Requirements

1. **Payment Idempotency:** The webhook and verification handlers must guarantee that no payment ID can be credited twice, even during concurrent delivery or re-transmissions.
2. **WebSocket Fallback Resilience:** When client sockets encounter firewalls or mobile disconnects, the system must seamlessly downgrade to exponential backoff HTTP polling without showing disconnect errors.
3. **Queue Eviction & Cleanup:** BullMQ completed and failed job entries must automatically prune after 7 days (`removeOnComplete: { age: 604800 }`, `removeOnFail: { age: 1209600 }`) to prevent Redis memory leaks.
4. **Rate Limiting:** Protect `/api/auth/forgot-password` and `/api/jobs` with strict IP and user rate limits to prevent email spamming and GPU denial of service.
