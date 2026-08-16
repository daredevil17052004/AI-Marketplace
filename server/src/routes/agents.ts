import { Router, Request, Response, NextFunction } from "express";
import { getAgentById, listAgents } from "../services/agentService.js";

const router = Router();

router.get("/", async(req, res, next)=>{
    try{
        const agents = await listAgents();
        res.json(agents);
    }catch(err){
        next(err);
    }
})

router.get("/:id", async(req, res, next)=>{
    try{
        const agent = await getAgentById(req.params.id);
        res.json(agent);
    }catch(err){
        next(err);
    }
})

export default router;