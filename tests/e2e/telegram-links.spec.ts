import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Telegram Links Integration', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  const TELEGRAM_FREE_GROUP_LINK = 'https://t.me/+Pb8X_nXzKu41N2Yy';

  test('Footer contains Telegram community link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    
    // Check Telegram icon link
    const telegramIcon = page.getByTestId('footer-telegram');
    await expect(telegramIcon).toBeVisible();
    await expect(telegramIcon).toHaveAttribute('href', TELEGRAM_FREE_GROUP_LINK);
    
    // Check Telegram text link
    const telegramLink = page.getByTestId('footer-telegram-link');
    await expect(telegramLink).toBeVisible();
    await expect(telegramLink).toHaveAttribute('href', TELEGRAM_FREE_GROUP_LINK);
    await expect(telegramLink).toContainText(/telegram/i);
  });

  test('Landing page How It Works section contains Telegram link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to How It Works section
    const howItWorksSection = page.getByTestId('how-it-works-section');
    await howItWorksSection.scrollIntoViewIfNeeded();
    
    // Check Telegram link in Step 2
    const telegramLink = page.getByTestId('how-it-works-telegram-link');
    await expect(telegramLink).toBeVisible();
    await expect(telegramLink).toHaveAttribute('href', TELEGRAM_FREE_GROUP_LINK);
    await expect(telegramLink).toContainText(/community/i);
  });

  test('FAQ page contains Telegram community CTA', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check FAQ page loaded
    await expect(page.getByTestId('faq-page')).toBeVisible();
    
    // Scroll to Telegram CTA
    const telegramBtn = page.getByTestId('faq-telegram-community-btn');
    await telegramBtn.scrollIntoViewIfNeeded();
    
    await expect(telegramBtn).toBeVisible();
    await expect(telegramBtn).toHaveAttribute('href', TELEGRAM_FREE_GROUP_LINK);
    await expect(telegramBtn).toContainText(/beitreten/i);
  });

  test('Auth modal contains Telegram community link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Open auth modal
    await page.getByRole('button', { name: /registrieren/i }).click();
    await expect(page.getByTestId('auth-modal')).toBeVisible();
    
    // Check Telegram link in modal
    const telegramLink = page.getByTestId('auth-telegram-community-link');
    await expect(telegramLink).toBeVisible();
    await expect(telegramLink).toHaveAttribute('href', TELEGRAM_FREE_GROUP_LINK);
    await expect(telegramLink).toContainText(/telegram/i);
  });

  test('Footer social links are present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    
    // Check all social links
    await expect(page.getByTestId('footer-facebook')).toBeVisible();
    await expect(page.getByTestId('footer-instagram')).toBeVisible();
    await expect(page.getByTestId('footer-tiktok')).toBeVisible();
    await expect(page.getByTestId('footer-twitch')).toBeVisible();
  });

  test('Footer legal links are present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    
    // Check legal links
    await expect(page.getByTestId('footer-faq')).toBeVisible();
    await expect(page.getByTestId('footer-impressum')).toBeVisible();
    await expect(page.getByTestId('footer-agb')).toBeVisible();
    await expect(page.getByTestId('footer-datenschutz')).toBeVisible();
    await expect(page.getByTestId('footer-kontakt')).toBeVisible();
  });
});
