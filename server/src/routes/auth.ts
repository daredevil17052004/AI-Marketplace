import { Router } from "express";
import { z } from "zod";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    loginWithGoogle,
    getUserProfile,
    changeUserPassword,
} from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

const googleSchema = z.object({
    idToken: z.string().min(1),
});

router.post("/register", async (req, res, next) => {
    try {
        const body = registerSchema.parse(req.body);
        const result = await registerUser(body.email, body.password);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const result = await loginUser(body.email, body.password);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post("/google", async (req, res, next) => {
    try {
        const body = googleSchema.parse(req.body);
        const result = await loginWithGoogle(body.idToken);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post("/refresh", async (req, res, next) => {
    try {
        const body = refreshSchema.parse(req.body);
        const result = await refreshAccessToken(body.refreshToken);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.get("/me", requireAuth, async (req, res, next) => {
    try {
        const profile = await getUserProfile(req.user!.userId);
        res.json(profile);
    } catch (err) {
        next(err);
    }
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

router.post("/change-password", requireAuth, async (req, res, next) => {
    try {
        const body = changePasswordSchema.parse(req.body);
        await changeUserPassword(req.user!.userId, body.currentPassword, body.newPassword);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
});

export default router;