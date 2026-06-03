import { test, expect } from "@playwright/test";

const BASE_URL = "https://renewal-flow-saas.vercel.app";

test.describe("RenewalFlow Authentication Suite", () => {

  // ==========================
  // End-to-End Testing
  // ==========================

  test("E2E - Login page loads successfully", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await expect(page).toHaveURL(/login/);

    await expect(
      page.locator('input[type="email"]')
    ).toBeVisible();

    await expect(
      page.locator('input[type="password"]')
    ).toBeVisible();
  });

  // ==========================
  // Form Validation Testing
  // ==========================

  test("Validation - Empty form submission", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.getByRole("button").click();

    await expect(page.locator("body"))
      .toContainText(/email/i);
  });

  test("Validation - Empty email", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(
      'input[type="password"]',
      'Password123'
    );

    await page.getByRole("button").click();

    await expect(page.locator("body"))
      .toContainText(/email/i);
  });

  test("Validation - Empty password", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(
      'input[type="email"]',
      'test@test.com'
    );

    await page.getByRole("button").click();

    await expect(page.locator("body"))
      .toContainText(/password/i);
  });

  test("Validation - Invalid email format", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(
      'input[type="email"]',
      'invalidemail'
    );

    await page.fill(
      'input[type="password"]',
      'Password123'
    );

    await page.getByRole("button").click();

    await expect(page.locator("body"))
      .toContainText(/email/i);
  });

  // ==========================
  // Login Flow Validation
  // ==========================

  test("Login - Invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill(
      'input[type="email"]',
      'wrong@test.com'
    );

    await page.fill(
      'input[type="password"]',
      'WrongPassword123'
    );

    await page.getByRole("button").click();

    await expect(page)
      .not.toHaveURL(/dashboard/);
  });

  test("Login - Password field masked", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const passwordField = page.locator(
      'input[type="password"]'
    );

    await expect(passwordField)
      .toHaveAttribute("type", "password");
  });

  // ==========================
  // Route Protection Testing
  // ==========================

  test("Protected Route - Dashboard", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    await expect(page.url())
      .toContain("login");
  });

  test("Protected Route - Clients", async ({ page }) => {
    await page.goto(`${BASE_URL}/clients`);

    await expect(page.url())
      .toContain("login");
  });

  test("Protected Route - Projects", async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);

    await expect(page.url())
      .toContain("login");
  });

  test("Protected Route - Domains", async ({ page }) => {
    await page.goto(`${BASE_URL}/domains`);

    await expect(page.url())
      .toContain("login");
  });

  test("Protected Route - Invoices", async ({ page }) => {
    await page.goto(`${BASE_URL}/invoices`);

    await expect(page.url())
      .toContain("login");
  });

  // ==========================
  // Automated Browser Testing
  // ==========================

  test("Browser Test - Refresh page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.reload();

    await expect(page)
      .toHaveURL(/login/);
  });

  test("Browser Test - Back button", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.goto(`${BASE_URL}`);

    await page.goBack();

    await expect(page)
      .toHaveURL(/login/);
  });

  test("Browser Test - Forward button", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.goto(`${BASE_URL}`);

    await page.goBack();

    await page.goForward();

    await expect(page)
      .toHaveURL(BASE_URL + "/");
  });

});
