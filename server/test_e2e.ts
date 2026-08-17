import { db } from "./src/db/index.js";
import { agents, creditsLedger, users } from "./src/db/schema.js";

async function run() {
    try {
        const email = `test-${Date.now()}@test.com`;
        const password = "password123";

        // 1. Register a user
        console.log("Registering user...");
        const registerRes = await fetch("http://localhost:4000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const registerData = await registerRes.json();
        const token = registerData.accessToken;
        const userId = registerData.user.id;
        console.log("Registered:", userId);

        // 2. Create an agent directly in DB
        console.log("Creating agent...");
        const [agent] = await db.insert(agents).values({
            name: "Test Agent",
            description: "An agent for testing",
            systemPrompt: "You are a test agent",
            inputSchema: { type: "object" },
            creditCost: 10,
            createdBy: userId,
        }).returning();
        console.log("Agent created:", agent.id);

        // 3. Try submitting a job
        console.log("Submitting job...");
        const jobRes = await fetch("http://localhost:4000/api/jobs", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                agentId: agent.id,
                inputPayload: { foo: "bar" }
            })
        });
        
        const jobData = await jobRes.json();
        console.log("Job submission response:", jobData);

        // 4. Check credits_ledger
        console.log("Checking credits_ledger for user...");
        const ledgerEntries = await db.query.creditsLedger.findMany({
            where: (ledger, { eq }) => eq(ledger.userId, userId)
        });
        console.log("Ledger entries:", ledgerEntries);

    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
}

run();
