import { Router } from "express";
import { z } from "zod";
import { getUserBalance, getUserLedger } from "../services/creditService.js";
import { createCreditOrder, verifyAndCreditPayment } from "../services/paymentService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All credit routes require authentication
router.use(requireAuth);

// GET /api/credits/balance
router.get("/balance", async (req, res, next) => {
    try {
        const result = await getUserBalance(req.user!.userId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/credits/ledger
router.get("/ledger", async (req, res, next) => {
    try {
        const ledger = await getUserLedger(req.user!.userId);
        res.json(ledger);
    } catch (err) {
        next(err);
    }
});

// POST /api/credits/order
// Creates a Razorpay order for the selected credit tier.
const orderSchema = z.object({
    credits: z.number().int().positive(),
});

router.post("/order", async (req, res, next) => {
    try {
        const { credits } = orderSchema.parse(req.body);
        const order = await createCreditOrder(credits);
        res.json(order);
    } catch (err) {
        next(err);
    }
});

// POST /api/credits/verify
// Verifies the Razorpay payment signature and credits the user's account.
const verifySchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    credits: z.number().int().positive(),
});

router.post("/verify", async (req, res, next) => {
    try {
        const body = verifySchema.parse(req.body);
        const result = await verifyAndCreditPayment(
            req.user!.userId,
            body.razorpayOrderId,
            body.razorpayPaymentId,
            body.razorpaySignature,
            body.credits
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;

