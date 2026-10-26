// src/services/creditService.ts
import { eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { creditsLedger } from "../db/schema.js";
import { ValidationError } from "../lib/errors.js";

export async function getUserBalance(userId: string): Promise<{ balance: number }> {
  const result = await db
    .select({ balance: sql<number>`coalesce(sum(${creditsLedger.amount}), 0)` })
    .from(creditsLedger)
    .where(eq(creditsLedger.userId, userId));

  return { balance: result[0]?.balance ?? 0 };
}

export async function getUserLedger(userId: string) {
  return db
    .select()
    .from(creditsLedger)
    .where(eq(creditsLedger.userId, userId))
    .orderBy(desc(creditsLedger.createdAt));
}

export async function topUpCredits(
  userId: string,
  amount: number
): Promise<{ balance: number }> {
  if (!Number.isInteger(amount) || amount < 1 || amount > 10000) {
    throw new ValidationError("Amount must be an integer between 1 and 10000.");
  }

  await db.insert(creditsLedger).values({
    userId,
    amount,
    reason: "topup",
  });

  return getUserBalance(userId);
}
