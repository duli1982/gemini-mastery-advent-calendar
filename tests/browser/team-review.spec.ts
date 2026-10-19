import { test, expect } from '@playwright/test';

test('hostable team review opens all 24 doors in both tracks before December',async({page})=>{
  await page.clock.install({time:new Date('2026-10-19T09:00:00Z')});
  for(const track of ['business','guided']) {
    await page.goto(`http://127.0.0.1:3008/?track=${track}`);
    await expect(page.locator('.review-banner')).toContainText('TEAM REVIEW');
    await expect(page.locator('.activity-card.unlocked')).toHaveCount(24);
    await expect(page.locator('.activity-card.locked')).toHaveCount(0);
    await page.getByRole('button',{name:/^Open day 24:/}).click();
    await expect(page.getByText('A little anticipation.')).toHaveCount(0);
    await expect(page.getByRole('button',{name:'Mark as tried',exact:true})).toBeVisible();
    await page.keyboard.press('Escape');
    const pending=page.waitForEvent('download'); await page.getByRole('button',{name:'Download workbook'}).click();
    expect((await pending).suggestedFilename()).toBe(`smarter-work-2026-${track}-workbook.pdf`);
  }
});
test('team review is marked for no indexing and retains clear context in discovery',async({page})=>{
  await page.goto('http://127.0.0.1:3008/?view=discover');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow, noarchive');
  await expect(page.locator('.review-banner')).toContainText('For the pilot team');
  await expect(page.locator('.catalogue-card')).toHaveCount(48);
  const robots=await page.request.get('http://127.0.0.1:3008/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toBe('User-agent: *\nDisallow: /\n');
});
test('the public build stays locked despite team-review URL parameters',async({page})=>{
  await page.clock.install({time:new Date('2026-10-19T09:00:00Z')});
  await page.goto('http://127.0.0.1:3007/?track=business&day=24&teamReview=1&openAll=1');
  await expect(page.locator('.review-banner')).toHaveCount(0);
  await expect(page.getByText('A little anticipation.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy work prompt',exact:true})).toHaveCount(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button',{name:'Available December 24'})).toBeDisabled();
});
