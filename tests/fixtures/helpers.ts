import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function login(page: Page, email: string, password: string) {
  // Click login button in navbar
  await page.getByRole('button', { name: /anmelden/i }).click();
  
  // Wait for auth modal
  await expect(page.getByTestId('auth-modal')).toBeVisible();
  
  // Fill login form
  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-password-input').fill(password);
  
  // Submit
  await page.getByTestId('auth-submit-btn').click();
  
  // Wait for modal to close (successful login)
  await expect(page.getByTestId('auth-modal')).not.toBeVisible();
}

export async function register(page: Page, name: string, email: string, password: string) {
  // Click register button in navbar
  await page.getByRole('button', { name: /registrieren/i }).click();
  
  // Wait for auth modal
  await expect(page.getByTestId('auth-modal')).toBeVisible();
  
  // Fill registration form
  await page.getByTestId('auth-name-input').fill(name);
  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-password-input').fill(password);
  
  // Submit
  await page.getByTestId('auth-submit-btn').click();
}
