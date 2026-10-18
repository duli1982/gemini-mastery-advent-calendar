import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('landing page, both tracks, filters, separate saved and tried progress', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /24 days/ })).toBeVisible();
  await page.getByRole('button', { name: 'Explore the learning journey' }).click();
  await expect(page.locator('.activity-card')).toHaveCount(24);
  await page.getByRole('button', { name: /^Open day 1:/ }).click();
  await page.getByRole('button', { name: 'Mark as tried', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Close activity' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: 'Business Activities', exact: true }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('combobox', { name: 'Department', exact: true }).selectOption('Finance');
  await expect(page.locator('.activity-card')).not.toHaveCount(24);
  await page.getByRole('combobox', { name: 'Department', exact: true }).selectOption('');
  await page.getByRole('combobox', { name: 'Tool', exact: true }).selectOption('Workspace Studio');
  await expect(page.locator('.activity-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await expect(page.locator('.activity-grid')).toHaveClass(/library-view/);
  await page.getByRole('button', { name: 'Guided Learning', exact: true }).click();
  await page.getByRole('button', { name: /^Saved/ }).click();
  await expect(page.locator('.activity-card')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: 'Business Activities', exact: true }).click();
  await page.getByRole('searchbox').fill('no-such-activity-qzx');
  await expect(page.getByRole('heading', { name: 'No discoveries here yet.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('deep links, browser history, keyboard and focus return', async ({ page }) => {
  await page.goto('/?track=business&day=5');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Studio: Incoming Request to Brief', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close activity' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Copy activity link' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Mark as tried', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Copy activity link' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close activity' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: /^Open day 1:/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Open day 1:/ })).toBeFocused();
  await page.getByRole('button', { name: 'Guided Learning', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Business Activities.' })).toBeVisible();
  await page.goto('/?track=guided&day=99');
  await expect(page.getByRole('heading', { name: /24 days/ })).toBeVisible();
});

test('practice tabs, actual CSV download and copy fallback', async ({ page }) => {
  await page.goto('/?track=business&day=8');
  await page.getByRole('tab', { name: /Practice materials/ }).click();
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  expect((await file).suggestedFilename()).toBe('dirty-fictional-training.csv');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) }, configurable: true }));
  await page.getByRole('button', { name: 'Copy example' }).click();
  await expect(page.getByRole('textbox', { name: 'Select this text and copy it manually' })).toBeVisible();
});

test('both PDF workbook downloads use the selected track', async ({ page }) => {
  for (const track of ['guided', 'business']) {
    await page.goto(`/?track=${track}`);
    const file = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download workbook' }).click();
    const download = await file;
    expect(download.suggestedFilename()).toBe(`smarter-work-2026-${track}-workbook.pdf`);
    expect(await download.failure()).toBeNull();
  }
});

test('storage failure keeps activities usable and gives feedback', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await page.goto('/?track=guided&day=1');
  await page.getByRole('button', { name: 'Mark as tried', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tried it', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(/Some progress could not be read or saved/)).toBeVisible();
  await page.getByRole('button', { name: 'Business Activities', exact: true }).click();
  await expect(page.locator('.activity-card')).toHaveCount(24);
});

test('production dates lock content and ignore openAll; all remain available in 2027', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-30T22:59:59Z') });
  await page.goto('http://127.0.0.1:3007/?track=business&day=1&openAll=1');
  await expect(page.getByText('A little anticipation.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Copy (work )?prompt/ })).toHaveCount(0);
  await expect(page.locator('.review-banner')).toHaveCount(0);
  await page.clock.setSystemTime(new Date('2026-11-30T23:00:01Z'));
  await page.clock.runFor(1100);
  await expect(page.getByRole('button', { name: /Copy work prompt/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Available December 24' })).toBeDisabled();
  await page.clock.setSystemTime(new Date('2027-01-01T12:00:00Z'));
  await page.clock.runFor(1100);
  await expect(page.getByRole('button', { name: 'Download workbook' })).toBeEnabled();
  await expect(page.getByText('All 24 gifts are yours to explore')).toBeVisible();
});

test('desktop and mobile layouts have no horizontal overflow', async ({ page }) => {
  mkdirSync('output/screenshots', { recursive: true });
  await page.goto('/');
  await page.screenshot({ path: 'output/screenshots/landing-desktop.png', fullPage: true });
  await page.goto('/?track=guided');
  await page.screenshot({ path: 'output/screenshots/calendar-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/?track=business', '/?track=guided&day=21']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'output/screenshots/lesson-mobile.png', fullPage: false });
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'output/screenshots/calendar-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/?track=business');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
