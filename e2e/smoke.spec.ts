import { test, expect } from "@playwright/test";

test("home page shows foundation heading and entrar link", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Zona Oeste Trocas/i);
  await expect(
    page.getByRole("heading", { name: /Trocas locais, perto de ti/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Entrar$/i })).toBeVisible();
});

test("entrar page shows magic link form", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /enviar link mágico/i }),
  ).toBeVisible();
  // Full magic-link OTP flow requires live Supabase mailer — skipped here.
});
