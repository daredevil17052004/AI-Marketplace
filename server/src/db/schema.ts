// This file is the single source of truth for our database structure.
// Drizzle reads this file and generates real SQL migrations from it.
// Every table, column, type, and relationship lives here.


import{
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    jsonb,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";

// ENUMS

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const jobStatusEnum = pgEnum("job_status", [
    "pending",
    "processing",
    "completed",
    "failed",
]);

//users table
export const users = pgTable("users",{
    id : uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    // We store only the CURRENT valid refresh token's id, not the token
    // itself. This lets us invalidate it instantly (e.g. on logout) by
    // just clearing this column - the old token becomes useless even
    // though it hasn't technically expired yet.
    currentRefreshTokenId: uuid("current_refresh_token_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

//agents table
export const agents = pgTable("agents",{
    id : uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    systemPrompt: text("system_prompt").notNull(),
     // jsonb stores the shape of inputs THIS agent expects, e.g.:
    // { "fields": [{ "name": "text", "type": "string", "required": true }] }
    // We validate incoming job requests against this at runtime with Zod.    
    inputSchema: jsonb("input_schema").notNull(),
    creditCost: integer("credit_cost").notNull().default(1),
    createdBy: uuid("created_by")
        .notNull()
        .references(() => users.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});


//jobs table
export const jobs = pgTable("jobs",{
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(()=> users.id),
    agentId: uuid("agent_id")
        .notNull()
        .references(()=> agents.id),
    status: jobStatusEnum("status").notNull().default("pending"),
    inputPayload: jsonb("input_payload").notNull(),
    outputResult: jsonb("output_result"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    durationMs: integer("duration_ms"),
})


//credits_lodger
export const creditsLedger = pgTable("credits_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // POSITIVE for top-ups/refunds, NEGATIVE for job charges.
  // A user's current balance = SUM(amount) WHERE user_id = X.
  // We NEVER update a stored balance directly - see the ledger
  // pattern explanation in the schema design discussion.
  amount: integer("amount").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(), // e.g. "job_charge", "signup_bonus", "topup"
  // Nullable because top-ups/bonuses aren't tied to a specific job.
  jobId: uuid("job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});