import { Router } from "express";
import { z } from "zod";
import { getUserBalance, getUserLedger, topUpCredits } from "../services/creditService.js";
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

// POST /api/credits/topup
const topUpSchema = z.object({
    amount: z.number().int().min(1).max(10000),
});

router.post("/topup", async (req, res, next) => {
    try {
        const body = topUpSchema.parse(req.body);
        const result = await topUpCredits(req.user!.userId, body.amount);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
