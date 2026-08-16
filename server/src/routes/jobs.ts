import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createJob, getJobById } from "../services/jobService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const createSchema = z.object({
    agentId: z.string(),
    inputPayload: z.record(z.string(), z.any()),
})

router.post("/", requireAuth, async(req, res, next)=>{
    try{
        const body = createSchema.parse(req.body);
        const job = await createJob(req.user!.userId, body.agentId, body.inputPayload);
        res.json(job);
    }catch(err){
        next(err);
    }
})

router.get("/:id", requireAuth, async(req, res, next)=>{
    try{
        const job = await getJobById(req.params.id as string, req.user!.userId);
        res.json(job);
    }catch(err){
        next(err);
    }
})  

export default router;