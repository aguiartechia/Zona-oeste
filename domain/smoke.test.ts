import { describe, expect, it } from "vitest";
import { identity } from "./index";

describe("domain smoke", () => {
  it("identity returns the same value", () => {
    expect(identity(true)).toBe(true);
    expect(identity(42)).toBe(42);
  });
});
