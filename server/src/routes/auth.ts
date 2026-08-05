import { Router, Request, Response, NextFunction } from "express";
import { z }from "zod";
import { registerUser, loginUser, refreshAccessToken, logoutUser,  } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),    
})


const refreshSchema = z.object({
    refreshToken: z.string().min(1)
})


router.post("/register", async(req, res, next)=>{
    try{
        const body  = registerSchema.parse(req.body);
        const result = await registerUser(body.email, body.password);
        res.status(201).json(result)
    }catch(err){
        next(err)
    }
})


router.post("/login", async(req, res, next)=>{
    try{
        const body = loginSchema.parse(req.body);
        const result = await loginUser(body.email, body.password);
        res.status(200).json(result);
    }catch(err){
        next(err);
    }
})

router.post("/refresh", async(req, res, next)=>{
    try{
        const body = refreshSchema.parse(req.body);
        const result = await refreshAccessToken(body.refreshToken);
        res.status(200).json(result);
    }catch(err){
        next(err)
    }
})

router.post("/logout", requireAuth, async(req, res, next)=>{
    try{
        await logoutUser(req.user!.userId);
        res.json({ message:"Logout Successful"});
    }catch(err){
        next(err);
    }
})

export default router;