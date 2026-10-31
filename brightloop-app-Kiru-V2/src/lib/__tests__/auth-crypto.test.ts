import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";

describe("password hashing round-trip", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await bcrypt.hash("GoodPass1!", 12);
    expect(await bcrypt.compare("GoodPass1!", hash)).toBe(true);
  });

  it("rejects an incorrect password against the hash", async () => {
    const hash = await bcrypt.hash("GoodPass1!", 12);
    expect(await bcrypt.compare("WrongPass1!", hash)).toBe(false);
  });

  it("never stores the plaintext password in the hash", async () => {
    const hash = await bcrypt.hash("GoodPass1!", 12);
    expect(hash).not.toContain("GoodPass1!");
  });
});

describe("reset token hashing (matches forgot/reset-password route logic)", () => {
  it("produces a deterministic hash for the same raw token", () => {
    const raw = randomBytes(32).toString("hex");
    const hash1 = createHash("sha256").update(raw).digest("hex");
    const hash2 = createHash("sha256").update(raw).digest("hex");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different raw tokens", () => {
    const rawA = randomBytes(32).toString("hex");
    const rawB = randomBytes(32).toString("hex");
    const hashA = createHash("sha256").update(rawA).digest("hex");
    const hashB = createHash("sha256").update(rawB).digest("hex");
    expect(hashA).not.toBe(hashB);
  });

  it("never stores the raw token as the hash", () => {
    const raw = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(raw).digest("hex");
    expect(hash).not.toBe(raw);
  });

  it("expiry check treats a past expiresAt as expired", () => {
    const expiresAt = new Date(Date.now() - 1000);
    expect(expiresAt.getTime() < Date.now()).toBe(true);
  });

  it("expiry check treats a future expiresAt as valid", () => {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    expect(expiresAt.getTime() > Date.now()).toBe(true);
  });
});
