import "dotenv/config";
import express from "express";
import authRoutes from './routes/auth.js'

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.use("/api/auth", authRoutes)

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
