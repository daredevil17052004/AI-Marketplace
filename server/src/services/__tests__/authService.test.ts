import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";

vi.mock("../../db/index.js", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

vi.mock("../../lib/tokens.js", () => ({
    signAccessToken: vi.fn().mockReturnValue("mock_access_token"),
    signRefreshToken: vi.fn().mockReturnValue("mock_refresh_token"),
    verifyRefreshToken: vi.fn(),
}));


import { db } from "../../db/index.js";
import bcrypt from "bcryptjs";
import { registerUser, loginUser } from "../authService.js";


describe("registerUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws ConflictError if email already exists", async () => {
        // ARRANGE: make db.select return a fake existing user
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: "existing-id" }]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        // ACT + ASSERT
        await expect(
            registerUser("existing@test.com", "password123")
        ).rejects.toThrow(ConflictError);  // which error class?
    });

    it("hashes the password before saving", async () => {
        // ARRANGE: email doesn't exist (empty array)
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),  // ← empty = no existing user
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

        const mockInsert = {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([
                { id: "new-id", email: "new@test.com", role: "user" },
            ]),
        };
        vi.mocked(db.insert).mockReturnValue(mockInsert as any);

        // ACT
        await registerUser("new@test.com", "password123");

        // ASSERT — was bcrypt.hash called with the right arguments?
        expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);  // password, salt rounds
    });

    it("returns tokens and user data after registering", async () => {
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);

        const mockInsert = {
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([
                { id: "new-id", email: "new@test.com", role: "user" },
            ]),
        };
        vi.mocked(db.insert).mockReturnValue(mockInsert as any);

        const result = await registerUser("new@test.com", "password123");

        expect(result).toMatchObject({
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            user: { id: "new-id", email: "new@test.com", role: "user" },
        });
    });
});

describe("loginUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws UnauthorizedError when the email is not found", async () => {
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        await expect(loginUser("missing@test.com", "password123")).rejects.toThrow(
            UnauthorizedError
        );
    });

    it("throws UnauthorizedError when the password is incorrect", async () => {
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([
                {
                    id: "user-id",
                    email: "user@test.com",
                    passwordHash: "hashed_password",
                    role: "user",
                    currentRefreshTokenId: null,
                },
            ]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

        await expect(loginUser("user@test.com", "wrong-password")).rejects.toThrow(
            UnauthorizedError
        );
    });

    it("returns tokens and updates the refresh token id on successful login", async () => {
        const mockSelect = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([
                {
                    id: "user-id",
                    email: "user@test.com",
                    passwordHash: "hashed_password",
                    role: "user",
                    currentRefreshTokenId: null,
                },
            ]),
        };
        vi.mocked(db.select).mockReturnValue(mockSelect as any);

        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

        const mockUpdate = {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(db.update).mockReturnValue(mockUpdate as any);

        const result = await loginUser("user@test.com", "password123");

        expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_password");
        expect(db.update).toHaveBeenCalled();
        expect(result).toMatchObject({
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            user: { id: "user-id", email: "user@test.com", role: "user" },
        });
    });
});


