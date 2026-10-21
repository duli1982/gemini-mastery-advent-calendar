import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const review='http://127.0.0.1:3008';
const guide=(page:import('@playwright/test').Page)=>page.getByRole('dialog',{name:'From the People, to the People.'});

test('first visit explains both tracks; dismissal persists and header help restores focus',async({page})=>{
  await page.goto(review+'/');await expect(guide(page)).toBeVisible();
  await expect(guide(page)).toContainText('Team review: all 24 doors in both tracks and both workbooks are open.');
  await expect(guide(page).getByRole('heading',{name:'Business Activities'})).toBeVisible();
  await expect(guide(page).getByRole('heading',{name:'Guided Learning'})).toBeVisible();
  await expect(guide(page).getByRole('heading',{name:'From the People, to the People.'})).toBeFocused();
  await page.getByRole('button',{name:'Start exploring'}).click();await expect(guide(page)).toHaveCount(0);
  await page.reload();await expect(guide(page)).toHaveCount(0);
  await page.getByRole('button',{name:'How to use',exact:true}).click();await expect(guide(page)).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'How to use',exact:true})).toBeFocused();
  await expect(page).toHaveURL(review+'/');
});

for(const [path,title] of [['/?track=guided&day=5','Catch AI Mistakes'],['/?track=business&day=8','Clean Data With a Correction Log'],['/?view=toolkit&task=email','Email That Moves Work Forward']]) {
  test(`welcome preserves the incoming link ${path}`,async({page})=>{
    await page.goto(review+path);await expect(guide(page)).toBeVisible();await expect(page.locator('.lesson-dialog')).toHaveCount(0);
    expect(await page.evaluate(()=>localStorage.getItem('smarter-work:2026:resume'))).toBeNull();
    await page.getByRole('button',{name:'Start exploring'}).click();await expect(page).toHaveURL(review+path);
    await expect(page.locator('.lesson-dialog').getByRole('heading',{name:title,exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Close activity'})).toBeFocused();
  });
}

test('normal welcome explains local December openings and preserves locked lessons',async({page})=>{
  await page.clock.install({time:new Date('2026-10-21T09:00:00Z')});
  await page.goto('http://127.0.0.1:3007/?track=business&day=24');
  await expect(guide(page)).toContainText('1–24 December 2026, at midnight in your local time.');
  await expect(guide(page)).not.toContainText('Team review:');
  await page.keyboard.press('Escape');await expect(page.getByText('A little anticipation.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy work prompt',exact:true})).toHaveCount(0);
});

test('blocked storage leaves the guide dismissible and reopening does not change the route',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
  await page.goto(review+'/?track=business');await expect(guide(page)).toBeVisible();
  await page.getByRole('button',{name:'Close how-to guide'}).click();await expect(guide(page)).toHaveCount(0);
  await expect(page.locator('.toast.show')).toContainText('Your browser could not remember this preference.');
  await page.getByRole('button',{name:'How to use',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page).toHaveURL(review+'/?track=business');
  await page.reload();await expect(guide(page)).toBeVisible();
});

test('welcome and mobile header are accessible, keyboard-operable and fit narrow screens',async({page})=>{
  mkdirSync('output/screenshots',{recursive:true});await page.goto(review+'/');
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)}))).toEqual([]);
  await page.screenshot({path:'output/screenshots/welcome-desktop.png',fullPage:false});
  await page.getByRole('button',{name:'Start exploring'}).focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close how-to guide'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Start exploring'})).toBeFocused();
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});await expect(page.getByRole('button',{name:'Start exploring'})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.screenshot({path:'output/screenshots/welcome-mobile.png',fullPage:false});
  await page.keyboard.press('Escape');
  for(const path of ['/','/?track=business','/?view=discover']) {await page.goto(review+path);await expect(page.getByRole('button',{name:'How to use',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('page metadata and practice material use the new attribution',async({page})=>{
  await page.goto(review+'/');await page.getByRole('button',{name:'Start exploring'}).click();
  await expect(page).toHaveTitle('24 Days of Smarter Work | From the People, to the People.');
  await expect(page.locator('body')).not.toContainText(/Randstad|\bGBS\b/i);
  await page.goto(review+'/?track=business&day=16');await page.getByRole('tab',{name:/Practice materials/}).click();
  await expect(page.locator('body')).not.toContainText(/Randstad|\bGBS\b/i);
});
