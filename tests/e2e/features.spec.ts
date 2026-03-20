import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('FAQ page loads correctly', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check page loaded
    await expect(page.getByTestId('faq-page')).toBeVisible();
    
    // Check header
    await expect(page.getByRole('heading', { name: /häufig gestellte fragen/i })).toBeVisible();
  });

  test('FAQ accordion functionality works', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Find first FAQ question
    const firstQuestion = page.getByText('Was ist BETRADARMUS?');
    await expect(firstQuestion).toBeVisible();
    
    // Click to expand
    await firstQuestion.click();
    
    // Answer should be visible
    await expect(page.getByText(/KI-gestützte Analyseplattform/i).first()).toBeVisible();
    
    // Click again to collapse
    await firstQuestion.click();
    
    // Wait a moment for animation
    await page.waitForTimeout(400);
  });

  test('FAQ categories are displayed', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check category headers
    await expect(page.getByText('Allgemein').first()).toBeVisible();
    await expect(page.getByText('Signale & Analyse').first()).toBeVisible();
    await expect(page.getByText('Telegram Bot').first()).toBeVisible();
    await expect(page.getByText('Preise & Pläne').first()).toBeVisible();
  });

  test('FAQ navigation from footer works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();
    
    // Click FAQ link
    await page.getByTestId('footer-faq').click();
    
    // Should navigate to FAQ page
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.getByTestId('faq-page')).toBeVisible();
  });
});

test.describe('Statistics Section', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Statistics section loads on landing page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to statistics section
    const statsSection = page.getByTestId('statistics-section');
    await statsSection.scrollIntoViewIfNeeded();
    
    await expect(statsSection).toBeVisible();
  });

  test('Statistics section displays key metrics', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to statistics section
    const statsSection = page.getByTestId('statistics-section');
    await statsSection.scrollIntoViewIfNeeded();
    
    // Check for key stat labels
    await expect(page.getByText(/trefferquote/i).first()).toBeVisible();
    await expect(page.getByText(/gesamte tipps/i).first()).toBeVisible();
    await expect(page.getByText(/roi/i).first()).toBeVisible();
  });

  test('Statistics button in hero scrolls to section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click statistics button
    await page.getByTestId('hero-stats-btn').click();
    
    // Wait for scroll
    await page.waitForTimeout(1000);
    
    // Statistics section should be in view
    const statsSection = page.getByTestId('statistics-section');
    await expect(statsSection).toBeInViewport();
  });
});

test.describe('Pricing Section', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Pricing cards are displayed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to pricing section using the section id
    await page.evaluate(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    
    // Check pricing cards exist
    await expect(page.getByText('FREE').first()).toBeVisible();
    await expect(page.getByText('PRO').first()).toBeVisible();
    await expect(page.getByText('ELITE').first()).toBeVisible();
  });

  test('Pricing shows correct prices', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Scroll to pricing section using the section id
    await page.evaluate(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    
    // Check prices - look for the price text patterns (€0, €49, €199)
    await expect(page.getByText('€0').first()).toBeVisible();
    await expect(page.getByText('€49').first()).toBeVisible();
    await expect(page.getByText('€199').first()).toBeVisible();
  });
});
