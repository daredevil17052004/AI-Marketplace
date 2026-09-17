import { eq, and, ilike, or, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents } from "../db/schema.js";
import { NotFoundError } from "../lib/errors.js";


export async function listAgents(search?: string){
    const filters: (SQL | undefined)[] = [eq(agents.isActive, true)];

    if (search) {
        filters.push(
            or(
                ilike(agents.description, `%${search}%`),
                ilike(agents.systemPrompt, `%${search}%`)
            )
        );
    }

    return db
        .select()
        .from(agents)
        .where(and(...filters))
}

export async function getAgentById(id: string){
    const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, id))
        .limit(1);

    if(!agent){
        throw new NotFoundError("Agent");
    }

    return agent;
}