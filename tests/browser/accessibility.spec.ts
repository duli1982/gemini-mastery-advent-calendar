import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [name, path] of [['landing', '/'], ['calendar', '/?track=guided'], ['lesson', '/?track=business&day=5'], ['discovery','/?view=discover'], ['toolkit','/?view=toolkit&task=email'], ['saved','/?view=saved']] as const) {
  test(`${name} passes automated accessibility checks`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(v => ({ id: v.id, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  });
}
