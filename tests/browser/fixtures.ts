import { test as base, expect } from '@playwright/test';

// Existing feature checks run as returning visitors. Welcome-guide tests import
// the base fixture directly and exercise the actual first-visit experience.
export const test=base.extend<{returningVisitor:void}>({
  returningVisitor:[async({page},use)=>{
    await page.addInitScript(()=>{try{localStorage.setItem('smarter-work:2026:welcome','1');}catch{}});
    await use();
  },{auto:true}],
});
export { expect };
