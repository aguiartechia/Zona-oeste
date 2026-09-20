import { describe, expect, it } from "vitest";
import {
  MAGIC_LINK_COOLDOWN_SECONDS,
  cooldownRemainingSeconds,
  genericMagicLinkSuccessMessage,
  parseMagicLinkEmail,
  resolveAuthRedirect,
} from "./auth";

describe("cooldownRemainingSeconds", () => {
  it("returns 0 when never sent", () => {
    expect(cooldownRemainingSeconds(null)).toBe(0);
    expect(cooldownRemainingSeconds(undefined)).toBe(0);
  });

  it("returns remaining seconds within cooldown window", () => {
    const now = 1_000_000;
    const sentAt = now - 15_000; // 15s ago
    expect(cooldownRemainingSeconds(sentAt, now, MAGIC_LINK_COOLDOWN_SECONDS)).toBe(45);
  });

  it("returns 0 after cooldown elapsed", () => {
    const now = 1_000_000;
    const sentAt = now - 61_000;
    expect(cooldownRemainingSeconds(sentAt, now)).toBe(0);
  });
});

describe("parseMagicLinkEmail", () => {
  it("normalizes email", () => {
    expect(parseMagicLinkEmail("A@B.COM")).toEqual({
      ok: true,
      value: "a@b.com",
    });
  });
});

describe("resolveAuthRedirect", () => {
  it("allowlists next or defaults to /perfil", () => {
    expect(resolveAuthRedirect("/onboarding")).toBe("/onboarding");
    expect(resolveAuthRedirect("https://evil.com")).toBe("/");
    expect(resolveAuthRedirect(null)).toBe("/perfil");
  });
});

describe("genericMagicLinkSuccessMessage", () => {
  it("does not leak whether the email exists", () => {
    const msg = genericMagicLinkSuccessMessage();
    expect(msg.toLowerCase()).toContain("email");
    expect(msg).not.toMatch(/não existe|não encontrado/i);
  });
});
