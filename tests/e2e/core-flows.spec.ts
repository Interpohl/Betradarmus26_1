import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Core Flows - Landing, Navigation, Auth', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Landing page loads with hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check landing page is visible
    await expect(page.getByTestId('landing-page')).toBeVisible();
    
    // Check hero section
    await expect(page.getByTestId('hero-section')).toBeVisible();
    
    // Check main CTA button
    await expect(page.getByTestId('hero-cta-btn')).toBeVisible();
    await expect(page.getByTestId('hero-cta-btn')).toContainText(/kostenlos/i);
  });

  test('Navigation links work correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check navbar links exist
    await expect(page.getByRole('link', { name: /problem/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /lösung/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /technologie/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /preise/i })).toBeVisible();
  });

  test('Auth modal opens on register button click', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click register button in navbar using data-testid (navbar-cta is the register button)
    await page.getByTestId('navbar-cta').click();
    
    // Auth modal should be visible
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Modal opens in login mode by default, switch to register
    await page.getByTestId('auth-switch-mode').click();
    
    // Check form fields exist (register mode has name field)
    await expect(page.getByTestId('auth-name-input')).toBeVisible();
    await expect(page.getByTestId('auth-email-input')).toBeVisible();
    await expect(page.getByTestId('auth-password-input')).toBeVisible();
    await expect(page.getByTestId('auth-submit-btn')).toBeVisible();
  });

  test('Auth modal opens on login button click', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click login button in navbar using data-testid
    await page.getByTestId('navbar-login').click();
    
    // Auth modal should be visible
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Check form fields exist (login mode - no name field)
    await expect(page.getByTestId('auth-email-input')).toBeVisible();
    await expect(page.getByTestId('auth-password-input')).toBeVisible();
    await expect(page.getByTestId('auth-submit-btn')).toBeVisible();
  });

  test('Auth modal can switch between login and register modes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open login modal
    await page.getByTestId('navbar-login').click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Switch to register mode
    await page.getByTestId('auth-switch-mode').click();
    
    // Name field should now be visible (register mode)
    await expect(page.getByTestId('auth-name-input')).toBeVisible();
    
    // Switch back to login mode
    await page.getByTestId('auth-switch-mode').click();
    
    // Name field should not be visible (login mode)
    await expect(page.getByTestId('auth-name-input')).not.toBeVisible();
  });

  test('Auth modal can be closed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open modal using navbar-cta (register button)
    await page.getByTestId('navbar-cta').click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Close modal
    await page.getByTestId('auth-modal-close').click();
    
    // Modal should be hidden
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
  });

  test('User registration flow works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open register modal using navbar-cta
    await page.getByTestId('navbar-cta').click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Switch to register mode (modal opens in login mode)
    await page.getByTestId('auth-switch-mode').click();
    
    // Fill registration form with unique email
    const uniqueEmail = `test_${Date.now()}@test.com`;
    await page.getByTestId('auth-name-input').fill('Test User');
    await page.getByTestId('auth-email-input').fill(uniqueEmail);
    await page.getByTestId('auth-password-input').fill('TestPassword123!');
    
    // Submit
    await page.getByTestId('auth-submit-btn').click();
    
    // Modal should close on successful registration
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
  });

  test('User login flow works with admin credentials', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open login modal
    await page.getByTestId('navbar-login').click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Fill login form
    await page.getByTestId('auth-email-input').fill('admin@betradarmus.de');
    await page.getByTestId('auth-password-input').fill('Betradarmus2024!');
    
    // Submit
    await page.getByTestId('auth-submit-btn').click();
    
    // Modal should close on successful login
    await expect(page.getByTestId('auth-modal')).not.toBeVisible();
  });
});
