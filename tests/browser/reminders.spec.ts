import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const production='http://127.0.0.1:3007';
const openProgress=(days:number[])=>Object.fromEntries(days.map(day=>[`business-${String(day).padStart(2,'0')}`,{opened:true,tried:true,saved:false,used:false}]));

test('daily and catch-up reminders respect track progress and focus filtered results',async({page})=>{
  await page.clock.install({time:new Date('2026-12-08T08:00:00Z')});
  await page.addInitScript(progress=>localStorage.setItem('smarter-work:2026:business',JSON.stringify(progress)),openProgress([1,2,3,4]));
  await page.goto(`${production}/?track=business`);
  const reminders=page.getByRole('region',{name:'Calendar reminders'});
  await expect(reminders.getByRole('heading',{name:'Day 8 is ready to explore.'})).toBeVisible();
  await expect(reminders).toContainText('3 earlier activities are waiting.');
  await page.getByRole('combobox',{name:'Department',exact:true}).selectOption('Finance');
  await reminders.getByRole('button',{name:'Explore unopened activities',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Department',exact:true})).toHaveValue('');
  await expect(page.locator('.activity-card')).toHaveCount(4);
  await expect(page.locator('.activity-card.locked')).toHaveCount(0);
  await expect(page.locator('#calendar-results')).toBeFocused();
  await reminders.getByRole('button',{name:'Open today’s door',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Unopened 3',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Guided Learning',exact:true}).click();
  await expect(page.getByRole('button',{name:'Unopened 8',exact:true})).toBeVisible();
  await expect(reminders).toContainText('7 earlier activities are waiting.');
});

test('dismiss today persists per track and expires at midnight; snooze lasts one visit',async({page})=>{
  await page.clock.install({time:new Date('2026-12-08T08:00:00Z')});
  await page.goto(`${production}/?track=business`);
  await page.getByRole('button',{name:'Dismiss calendar reminders for today'}).click();
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/Show calendar reminders/})).toBeFocused();
  await page.reload();await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await page.getByRole('button',{name:'Guided Learning',exact:true}).click();await expect(page.getByRole('region',{name:'Calendar reminders'})).toBeVisible();
  await page.getByRole('button',{name:'Business Activities',exact:true}).click();
  await page.clock.setSystemTime(new Date('2026-12-08T23:00:01Z'));await page.clock.runFor(1100);
  await expect(page.getByRole('heading',{name:'Day 9 is ready to explore.'})).toBeVisible();
  await page.getByRole('button',{name:'Remind me next visit',exact:true}).click();
  await page.getByRole('button',{name:'Explore both tracks',exact:true}).click();
  await page.getByRole('button',{name:'Explore business activities',exact:true}).click();
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await page.getByRole('button',{name:/Show calendar reminders/}).click();
  await expect(page.locator('#calendar-reminder-heading')).toBeFocused();
  await page.getByRole('button',{name:'Remind me next visit',exact:true}).click();
  await page.reload();await expect(page.getByRole('region',{name:'Calendar reminders'})).toBeVisible();
});

test('midnight updates without reload, and opened lessons receive a practice suggestion',async({page})=>{
  await page.clock.install({time:new Date('2026-11-30T22:59:59Z')});
  await page.goto(`${production}/?track=business`);await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(page.getByRole('heading',{name:'Day 1 is ready to explore.'})).toBeVisible();
  await expect(page.locator('.toast.show')).toContainText('Day 1 is ready to explore in Business Activities.');
  await expect(page.locator('.toast.show').getByRole('button',{name:'Open day 1',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Open today’s door',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Ready to put this into practice?'})).toBeVisible();
  await page.getByRole('button',{name:'Revisit day 1',exact:true}).click();
  await page.getByRole('button',{name:'Mark as tried',exact:true}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'You’ve explored all available doors.'})).toBeVisible();
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toContainText('2 December');
  await page.clock.setSystemTime(new Date('2027-01-01T08:00:00Z'));await page.clock.runFor(1100);
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toContainText('23 available activities you haven’t opened.');
  await expect(page.getByRole('button',{name:'Open today’s door',exact:true})).toHaveCount(0);
});

test('blocked storage keeps reminders and dismissal usable',async({page})=>{
  await page.clock.install({time:new Date('2026-12-08T08:00:00Z')});
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
  await page.goto(`${production}/?track=business`);
  await page.getByRole('button',{name:'Start exploring'}).click();
  await page.getByRole('button',{name:'Dismiss calendar reminders for today'}).click();
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await expect(page.getByRole('status').filter({hasText:'Your reminder preference could not be saved'})).toBeVisible();
  await page.getByRole('button',{name:/Show calendar reminders/}).click();await expect(page.getByRole('region',{name:'Calendar reminders'})).toBeVisible();
});

test('review mode has the review banner and unopened filter but no daily reminders',async({page})=>{
  await page.clock.install({time:new Date('2026-12-08T08:00:00Z')});
  await page.goto('http://127.0.0.1:3008/?track=guided');
  await expect(page.locator('.review-banner')).toContainText('TEAM REVIEW');
  await expect(page.getByRole('region',{name:'Calendar reminders'})).toHaveCount(0);
  await page.getByRole('button',{name:'Unopened 24',exact:true}).click();await expect(page.locator('.activity-card')).toHaveCount(24);
});

test('calendar dropdowns use full-width labelled controls; reminder layout is accessible and responsive',async({page})=>{
  mkdirSync('output/screenshots',{recursive:true});
  await page.clock.install({time:new Date('2026-12-08T08:00:00Z')});
  await page.goto(`${production}/?track=business`);
  for(const name of ['Department','Tool']) {
    const control=page.getByRole('combobox',{name,exact:true});
    expect(await control.evaluate(el=>Math.abs(el.getBoundingClientRect().width-el.parentElement!.getBoundingClientRect().width)<2)).toBe(true);
    expect(await control.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(12);
  }
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)}))).toEqual([]);
  await page.screenshot({path:'output/screenshots/calendar-reminders-desktop.png',fullPage:false});
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.screenshot({path:'output/screenshots/calendar-reminders-mobile.png',fullPage:true});
});
