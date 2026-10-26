import { Router } from "express";
import { z } from "zod";
import {
    listAllAgents,
    createAgent,
    updateAgent,
    toggleAgent,
    deleteAgent,
    listAllJobs,
    listAllUsers,
} from "../services/adminService.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

// ─── Agents ───────────────────────────────────────────────────────────────────

const agentSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    systemPrompt: z.string().min(1),
    inputSchema: z.record(z.string(), z.any()),
    creditCost: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
});

router.get("/agents", async (_req, res, next) => {
    try {
        res.json(await listAllAgents());
    } catch (err) { next(err); }
});

router.post("/agents", async (req, res, next) => {
    try {
        const body = agentSchema.parse(req.body);
        const agent = await createAgent(body, req.user!.userId);
        res.status(201).json(agent);
    } catch (err) { next(err); }
});

router.put("/agents/:id", async (req, res, next) => {
    try {
        const body = agentSchema.partial().parse(req.body);
        const agent = await updateAgent(req.params.id, body);
        res.json(agent);
    } catch (err) { next(err); }
});

router.patch("/agents/:id/toggle", async (req, res, next) => {
    try {
        const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
        const agent = await toggleAgent(req.params.id, isActive);
        res.json(agent);
    } catch (err) { next(err); }
});

router.delete("/agents/:id", async (req, res, next) => {
    try {
        res.json(await deleteAgent(req.params.id));
    } catch (err) { next(err); }
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

router.get("/jobs", async (_req, res, next) => {
    try {
        res.json(await listAllJobs());
    } catch (err) { next(err); }
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", async (_req, res, next) => {
    try {
        res.json(await listAllUsers());
    } catch (err) { next(err); }
});

export default router;
