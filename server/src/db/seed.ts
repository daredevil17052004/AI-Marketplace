import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index.js";
import { users, agents, creditsLedger } from "./schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // 1. Create or get demo user
  const demoEmail = "demo@example.com";
  let [demoUser] = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);

  if (!demoUser) {
    const passwordHash = await bcrypt.hash("password123", 10);
    [demoUser] = await db.insert(users).values({
      email: demoEmail,
      passwordHash,
      role: "admin",
    }).returning();
    console.log(`Created demo user: ${demoUser.email} (id: ${demoUser.id})`);

    // Give credits
    await db.insert(creditsLedger).values({
      userId: demoUser.id,
      amount: 100,
      reason: "signup_bonus",
    });
  } else {
    console.log(`Demo user already exists: ${demoUser.email}`);
  }

  // 2. Create sample agents
  const sampleAgents = [
    {
      name: "Code Refactor Pro",
      description: "Transforms messy code into clean, idiomatic, well-documented architecture with type safety.",
      systemPrompt: "You are an expert software architect and code refactoring specialist. Analyze the submitted code and return a refactored version adhering to clean code, SOLID principles, optimal performance, and clear explanations.",
      creditCost: 2,
      inputSchema: {
        fields: [
          { name: "language", label: "Programming Language", type: "select", options: ["TypeScript", "JavaScript", "Python", "Go", "Rust"], defaultValue: "TypeScript", required: true },
          { name: "code", label: "Source Code to Refactor", type: "textarea", placeholder: "Paste your function or module here...", required: true },
        ],
      },
      createdBy: demoUser.id,
      isActive: true,
    },
    {
      name: "Text Summarizer",
      description: "Summarizes long-form articles, reports, transcripts, or notes into concise, actionable key takeaways.",
      systemPrompt: "You are an executive assistant and master summarizer. Extract the most critical points, executive summary, and key takeaways concisely and clearly in bullet points.",
      creditCost: 1,
      inputSchema: {
        fields: [
          { name: "text", label: "Text to Summarize", type: "textarea", placeholder: "Paste your article, meeting notes, or text here...", required: true },
          { name: "length", label: "Summary Length", type: "select", options: ["Short (3 bullets)", "Medium (Executive Summary)", "Deep Dive"], defaultValue: "Short (3 bullets)", required: false },
        ],
      },
      createdBy: demoUser.id,
      isActive: true,
    },
    {
      name: "SEO Content Generator",
      description: "Drafts high-ranking, engaging blog posts and articles tailored to your focus keywords and audience.",
      systemPrompt: "You are a professional SEO copywriter. Craft an engaging, informative article optimized for search engines with compelling H1/H2 headings, intro, body paragraphs, and FAQ.",
      creditCost: 3,
      inputSchema: {
        fields: [
          { name: "topic", label: "Article Topic / Title", type: "text", placeholder: "e.g. Next.js 15 Performance Best Practices", required: true },
          { name: "keywords", label: "Target Keywords (comma-separated)", type: "text", placeholder: "e.g. Next.js, React 19, web performance", required: true },
          { name: "tone", label: "Writing Tone", type: "select", options: ["Professional", "Conversational", "Technical", "Inspiring"], defaultValue: "Professional", required: false },
        ],
      },
      createdBy: demoUser.id,
      isActive: true,
    },
    {
      name: "Regex & Schema Generator",
      description: "Creates resilient Regular Expressions, JSON Schemas, or Zod schemas from plain English descriptions.",
      systemPrompt: "You are a data validation expert. Generate the exact regular expression or schema requested along with test cases and explanation.",
      creditCost: 1,
      inputSchema: {
        fields: [
          { name: "requirement", label: "Description of what to match / validate", type: "textarea", placeholder: "e.g. Match international phone numbers or parse ISO 8601 timestamps", required: true },
          { name: "outputType", label: "Target Output", type: "select", options: ["Regex (JavaScript/PCRE)", "Zod Schema", "JSON Schema"], defaultValue: "Regex (JavaScript/PCRE)", required: true },
        ],
      },
      createdBy: demoUser.id,
      isActive: true,
    },
  ];

  for (const agentData of sampleAgents) {
    const existing = await db.select().from(agents).where(eq(agents.name, agentData.name)).limit(1);
    if (existing.length === 0) {
      const [created] = await db.insert(agents).values(agentData).returning();
      console.log(`Created agent: ${created.name} (${created.id})`);
    } else {
      console.log(`Agent already exists: ${agentData.name}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
