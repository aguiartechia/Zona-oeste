import { test, expect } from "@playwright/test";

test("home page shows foundation heading", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Zona Oeste Trocas/i);
  await expect(
    page.getByRole("heading", { name: /Trocas locais, perto de ti/i }),
  ).toBeVisible();
});
