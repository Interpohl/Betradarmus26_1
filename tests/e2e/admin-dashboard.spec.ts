import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Admin dashboard requires authentication', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should show access denied or redirect
    // Check for either access denied message or redirect to login
    const accessDenied = page.getByText(/zugriff verweigert/i);
    const upgradeButton = page.getByRole('button', { name: /upgrade/i });
    
    // Either access denied message or upgrade prompt should be visible
    const isAccessDenied = await accessDenied.isVisible().catch(() => false);
    const isUpgradeVisible = await upgradeButton.isVisible().catch(() => false);
    
    expect(isAccessDenied || isUpgradeVisible).toBeTruthy();
  });

  test('Admin dashboard accessible after elite login', async ({ page }) => {
    // First login as admin
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open login modal using data-testid
    await page.getByTestId('navbar-login').click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Fill login form
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    
    // Submit
    await page.getByTestId('auth-submit-btn').click();
    
    // Wait for modal to close
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin dashboard
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should see admin dashboard content
    await expect(page.getByText(/admin dashboard/i)).toBeVisible();
  });

  test('Admin dashboard tabs are visible', async ({ page }) => {
    // Login as admin first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('navbar-login').click();
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    await page.getByTestId('auth-submit-btn').click();
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check tabs exist
    await expect(page.getByRole('button', { name: /übersicht/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ki generator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /signale/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /telegram nutzer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /website nutzer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zahlungen/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /e-mail/i })).toBeVisible();
  });

  test('Admin dashboard KI Generator tab works', async ({ page }) => {
    // Login as admin first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('navbar-login').click();
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    await page.getByTestId('auth-submit-btn').click();
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click KI Generator tab
    await page.getByRole('button', { name: /ki generator/i }).click();
    
    // Check generator content is visible - use heading role for specificity
    await expect(page.getByRole('heading', { name: /ki signal generator/i })).toBeVisible();
    await expect(page.getByText(/analyse-intervall/i).first()).toBeVisible();
  });

  test('Admin dashboard Users tab works', async ({ page }) => {
    // Login as admin first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('navbar-login').click();
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    await page.getByTestId('auth-submit-btn').click();
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click Website Users tab
    await page.getByRole('button', { name: /website nutzer/i }).click();
    
    // Check users content is visible - use heading role for specificity
    await expect(page.getByRole('heading', { name: /website nutzer/i })).toBeVisible();
  });

  test('Admin dashboard Payments tab works', async ({ page }) => {
    // Login as admin first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('navbar-login').click();
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    await page.getByTestId('auth-submit-btn').click();
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click Payments tab
    await page.getByRole('button', { name: /zahlungen/i }).click();
    
    // Check payments content is visible
    await expect(page.getByText(/gesamtumsatz/i)).toBeVisible();
    await expect(page.getByText(/zahlungshistorie/i)).toBeVisible();
  });

  test('Admin dashboard Email tab works', async ({ page }) => {
    // Login as admin first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('navbar-login').click();
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    await page.getByTestId('auth-submit-btn').click();
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
    
    // Navigate to admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click Email tab
    await page.getByRole('button', { name: /e-mail/i }).click();
    
    // Check email content is visible
    await expect(page.getByText(/e-mail an nutzer senden/i)).toBeVisible();
    await expect(page.getByText(/empfänger/i)).toBeVisible();
    await expect(page.getByText(/betreff/i)).toBeVisible();
  });
});
