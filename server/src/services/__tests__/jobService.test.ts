import { describe, it, expect, vi, beforeEach } from "vitest";
import { InsufficientCreditsError } from "../../lib/errors.js";

vi.mock("../../db/index.js", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        transaction: vi.fn(),
    },
}));

vi.mock("../../lib/queue.js", () => ({
    enqueueAgentJob: vi.fn(),
}));

vi.mock("../agentService.js", () => ({
    getAgentById: vi.fn(),
}));

import { db } from "../../db/index.js";
import { createJob } from "../jobService.js";
import { getAgentById } from "../agentService.js";

describe("createJob", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws InsufficientCreditsError when balance is 0", async () => {
        // ARRANGE
        // Mock getAgentById to return an agent with a creditCost > 0
        vi.mocked(getAgentById).mockResolvedValue({
            id: "agent-123",
            name: "Test Agent",
            description: "Test",
            creditCost: 10,
            webhookUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
        } as any);

        // Mock db.select to return a balance of 0
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue([{ balance: 0 }]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        // ACT + ASSERT
        await expect(
            createJob("user-123", "agent-123", { test: "payload" })
        ).rejects.toThrow(InsufficientCreditsError);
    });
});
