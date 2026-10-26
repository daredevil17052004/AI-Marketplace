import { Router } from "express";
import { z } from "zod";
import { createJob, getJobById, listUserJobs } from "../services/jobService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createSchema = z.object({
    agentId: z.string(),
    inputPayload: z.record(z.string(), z.any()),
});

// GET /api/jobs — list all jobs for the current authenticated user
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const jobs = await listUserJobs(req.user!.userId);
        res.json(jobs);
    } catch (err) {
        next(err);
    }
});

// POST /api/jobs — submit a new job
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const body = createSchema.parse(req.body);
        const job = await createJob(req.user!.userId, body.agentId, body.inputPayload);
        res.json(job);
    } catch (err) {
        next(err);
    }
});

// GET /api/jobs/:id — get a single job (ownership-checked)
router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const job = await getJobById(req.params.id as string, req.user!.userId);
        res.json(job);
    } catch (err) {
        next(err);
    }
});

export default router;