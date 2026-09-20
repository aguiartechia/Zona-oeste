import { describe, expect, it } from "vitest";
import {
  allowlistRedirect,
  isProfileComplete,
  toPublicProfile,
  validateDisplayName,
  validateEmail,
} from "./profile";

describe("validateDisplayName", () => {
  it("accepts 2–80 char names", () => {
    expect(validateDisplayName("Ab")).toEqual({ ok: true, value: "Ab" });
    expect(validateDisplayName("  Ana  ")).toEqual({ ok: true, value: "Ana" });
  });

  it("rejects too short or too long", () => {
    expect(validateDisplayName("A").ok).toBe(false);
    expect(validateDisplayName("x".repeat(81)).ok).toBe(false);
    expect(validateDisplayName(null).ok).toBe(false);
  });
});

describe("validateEmail", () => {
  it("accepts simple emails and normalizes case", () => {
    expect(validateEmail("User@Example.COM")).toEqual({
      ok: true,
      value: "user@example.com",
    });
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("nope").ok).toBe(false);
    expect(validateEmail("@x.com").ok).toBe(false);
    expect(validateEmail("a@").ok).toBe(false);
  });
});

describe("isProfileComplete", () => {
  it("requires name, municipality and onboarding timestamp", () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(
      isProfileComplete({
        display_name: "Ana",
        municipality_id: "m1",
        onboarding_completed_at: null,
      }),
    ).toBe(false);
    expect(
      isProfileComplete({
        display_name: "Ana",
        municipality_id: "m1",
        onboarding_completed_at: "2026-09-20T12:00:00Z",
      }),
    ).toBe(true);
    expect(
      isProfileComplete({
        display_name: "Ana",
        municipality_id: "m1",
        onboarding_completed_at: "2026-09-20T12:00:00Z",
        deleted_at: "2026-09-21T12:00:00Z",
      }),
    ).toBe(false);
  });
});

describe("allowlistRedirect", () => {
  it("allows safe relative paths", () => {
    expect(allowlistRedirect("/")).toBe("/");
    expect(allowlistRedirect("/perfil")).toBe("/perfil");
    expect(allowlistRedirect("/onboarding")).toBe("/onboarding");
    expect(allowlistRedirect("/entrar?next=/perfil")).toBe("/entrar?next=/perfil");
  });

  it("rejects open redirects", () => {
    expect(allowlistRedirect("https://evil.com")).toBe("/");
    expect(allowlistRedirect("//evil.com")).toBe("/");
    expect(allowlistRedirect("/admin")).toBe("/");
    expect(allowlistRedirect(undefined)).toBe("/");
  });
});

describe("toPublicProfile", () => {
  it("strips locality", () => {
    const pub = toPublicProfile({
      id: "1",
      display_name: "Ana",
      bio: null,
      avatar_url: null,
      municipality_id: "m1",
      parish: "Centro",
      locality: "secret-street",
      created_at: "2026-01-01T00:00:00Z",
    });
    expect(pub).not.toHaveProperty("locality");
    expect(pub.parish).toBe("Centro");
  });
});
