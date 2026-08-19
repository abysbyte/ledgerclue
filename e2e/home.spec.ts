import { test, expect } from '@playwright/test';

test.describe('LedgerClue Web Interface E2E Tests', () => {
  test('loads homepage and displays branding & navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify title and brand element
    await expect(page.getByText('LedgerClue', { exact: false })).toBeVisible();
    await expect(page.getByText('AI Due Diligence')).toBeVisible();

    // Verify main navigation tabs are visible
    await expect(page.getByText('Due Diligence Copilot')).toBeVisible();
    await expect(page.getByText('Document Ingestion')).toBeVisible();
    await expect(page.getByText('Qdrant Payload Inspector')).toBeVisible();
  });

  test('switches tabs smoothly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click Document Ingestion tab
    await page.getByText('Document Ingestion').click();

    // Verify ingestion view title or elements
    await expect(page.getByText('Multi-Modal Document Parser & Ingestion Pipeline', { exact: false })).toBeVisible();

    // Click Vector Inspector tab
    await page.getByText('Qdrant Payload Inspector').click();
    await expect(page.getByText('Qdrant Hybrid Vector Inspector', { exact: false })).toBeVisible();
  });
});
