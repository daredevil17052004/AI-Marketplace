import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "../db/index.js";
import { creditsLedger } from "../db/schema.js";
import { ValidationError, AppError } from "../lib/errors.js";
import { getUserBalance } from "./creditService.js";

// --------------------------------------------------------------------------
// Credit tiers — must stay in sync with the frontend TIERS array
// --------------------------------------------------------------------------
export const CREDIT_TIERS: Record<number, { priceInr: number; label: string }> =
  {
    50: { priceInr: 420, label: "Starter" },        // ~$5 at 84 INR/USD
    200: { priceInr: 1260, label: "Builder Pro" },   // ~$15
    1000: { priceInr: 5040, label: "Scale Studio" }, // ~$60
  };

// --------------------------------------------------------------------------
// Razorpay instance (lazy-initialised so the app can start without keys)
// --------------------------------------------------------------------------
function getRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new AppError(
      503,
      "Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// --------------------------------------------------------------------------
// Create a Razorpay order for the selected credit tier
// --------------------------------------------------------------------------
export async function createCreditOrder(credits: number): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  credits: number;
  keyId: string;
}> {
  const tier = CREDIT_TIERS[credits];
  if (!tier) {
    throw new ValidationError(
      `Invalid credit package. Allowed: ${Object.keys(CREDIT_TIERS).join(", ")}.`
    );
  }

  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: tier.priceInr * 100, // Razorpay expects paise
    currency: "INR",
    receipt: `credits_${credits}_${Date.now()}`,
    notes: { credits: String(credits), label: tier.label },
  });

  return {
    orderId: order.id,
    amount: tier.priceInr * 100,
    currency: "INR",
    credits,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

// --------------------------------------------------------------------------
// Verify Razorpay signature and deposit credits into the user's ledger
// --------------------------------------------------------------------------
export async function verifyAndCreditPayment(
  userId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  credits: number
): Promise<{ balance: number }> {
  // 1. Verify HMAC signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new AppError(503, "Payment gateway secret is not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new AppError(400, "Payment verification failed — invalid signature.");
  }

  // 2. Validate tier
  if (!CREDIT_TIERS[credits]) {
    throw new ValidationError("Invalid credit amount in verified payment.");
  }

  // 3. Insert ledger entry
  await db.insert(creditsLedger).values({
    userId,
    amount: credits,
    reason: "topup",
  });

  return getUserBalance(userId);
}
