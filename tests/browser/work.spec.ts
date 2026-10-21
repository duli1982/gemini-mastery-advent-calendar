import { test, expect } from './fixtures';
import { readFileSync } from 'node:fs';

test.beforeEach(async ({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:(text:string)=>{(window as unknown as {copied:string}).copied=text;return Promise.resolve();}},configurable:true}));
});
const copied = (page:import('@playwright/test').Page)=>page.evaluate(()=>(window as unknown as {copied:string}).copied);

test('business starts with work, guided starts with practice, and related links cross tracks',async({page})=>{
  await page.goto('/?track=business&day=9');
  await expect(page.getByRole('tab',{name:'Use it for my work'})).toHaveAttribute('aria-selected','true');
  await page.getByRole('button',{name:'Copy work prompt',exact:true}).click();
  expect(await copied(page)).toContain('not assigned / not agreed');
  expect(await copied(page)).not.toContain('Priya');
  await page.getByRole('button',{name:'Open related activity'}).click();
  await expect(page).toHaveURL(/track=guided&day=4/);
  await expect(page.getByRole('tab',{name:'Practise with an example'})).toHaveAttribute('aria-selected','true');
  await page.getByRole('button',{name:'Apply the technique to my work'}).click();
  await expect(page.getByRole('button',{name:'Copy work prompt',exact:true})).toBeVisible();
});

test('practice copying excludes answer keys and worked calculations are revealed separately',async({page})=>{
  await page.goto('/?track=business&day=10');
  await page.getByRole('tab',{name:'Practise with an example'}).click();
  await page.getByRole('button',{name:'Copy prompt + practice inputs',exact:true}).click();
  const input=await copied(page);
  expect(input).toContain('2026-W47,North,100,90,72,90');
  expect(input).not.toMatch(/Answer key|Created increased 33.33%|138\/170=81/);
  const solution=page.getByText('W47 created: 100+50=150.',{exact:false});
  await expect(solution).not.toBeVisible();
  await page.getByText('Reveal the worked example',{exact:true}).click();
  await expect(solution).toBeVisible();
});

test('department variation separates its work prompt from the example and downloads a complete job aid',async({page})=>{
  await page.goto('/?track=business&day=4');
  await page.getByLabel('Adapt for a department').selectOption('finance-query');
  await page.getByRole('button',{name:'Copy work prompt',exact:true}).click();
  expect(await copied(page)).toContain('invoice query'); expect(await copied(page)).not.toContain('INV-507');
  await page.getByText('Try this department example',{exact:true}).click();
  await page.getByRole('button',{name:'Copy department practice'}).click();
  expect(await copied(page)).toContain('INV-507');
  const pending=page.waitForEvent('download'); await page.getByRole('button',{name:'Download job aid'}).click();
  const download=await pending; expect(download.suggestedFilename()).toBe('business-04-finance-query-work-job-aid.txt');
  const text=readFileSync((await download.path())!,'utf8');
  for(const heading of ['HAVE READY','WORK PROMPT','OUTPUT TEMPLATE','CHECK']) expect(text).toContain(heading);
  expect(text).not.toContain('INV-507');
  await page.getByRole('button',{name:'Copy activity link'}).click(); expect(await copied(page)).toContain('?track=business&day=4');
  await page.goto('/?track=business&day=18'); await page.getByLabel('Adapt for a department').selectOption('operations-handover');
  await expect(page.getByRole('link',{name:'Open Google Docs'})).toHaveAttribute('href','https://docs.google.com/document/');
  await expect(page.getByRole('heading',{name:'A handover that a covering colleague can check and use.'})).toBeVisible();
});

test('discovery searches both tracks with task synonyms, time and experience filters',async({page})=>{
  await page.goto('/?view=discover');
  await expect(page.locator('.catalogue-card')).toHaveCount(48);
  await page.getByRole('searchbox',{name:'Search both tracks'}).fill('meeting minutes');
  await expect(page.getByRole('heading',{name:'Confirm Meeting Actions',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Meeting Notes to Confirmed Actions',exact:true})).toBeVisible();
  await page.getByLabel('Activity time',{exact:true}).selectOption('10');
  await page.getByLabel('Experience',{exact:true}).selectOption('Starter');
  await page.getByLabel('Track filter').selectOption('business');
  await expect(page.locator('.catalogue-card')).not.toHaveCount(0);
  await expect(page.locator('.catalogue-card').filter({hasText:'GUIDED LEARNING'})).toHaveCount(0);
});

test('used-at-work, saved, resume and backup import/export survive across both tracks',async({page})=>{
  await page.goto('/?track=business&day=4');
  await page.getByRole('button',{name:'Mark as used at work',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await page.keyboard.press('Escape');
  await page.goto('/?track=guided&day=3'); await page.getByRole('button',{name:'Save',exact:true}).click(); await page.keyboard.press('Escape');
  await page.reload(); await page.getByRole('button',{name:'Continue where I stopped'}).click(); await expect(page).toHaveURL(/track=guided&day=3/); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'My saved toolkit',exact:true}).click();
  await expect(page.locator('.catalogue-card')).toHaveCount(2);
  await expect(page.getByText('Used in my work',{exact:true})).toBeVisible();
  const pending=page.waitForEvent('download'); await page.getByRole('button',{name:'Export toolkit backup'}).click(); const file=await pending; const backup=readFileSync((await file.path())!);
  await page.evaluate(()=>localStorage.clear()); await page.reload(); await expect(page.locator('.catalogue-card')).toHaveCount(0);
  await page.getByLabel('Choose toolkit backup').setInputFiles({name:'toolkit.json',mimeType:'application/json',buffer:backup});
  await expect(page.locator('.catalogue-card')).toHaveCount(2);
  await page.reload(); await expect(page.locator('.catalogue-card')).toHaveCount(2);
  await page.getByLabel('Choose toolkit backup').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from('{"edition":2025}')});
  await expect(page.locator('.backup-message')).toContainText('Choose a 2026'); await expect(page.locator('.catalogue-card')).toHaveCount(2);
});

test('production toolkit works before December without opening a calendar lesson or workbook',async({page})=>{
  await page.clock.install({time:new Date('2026-10-18T12:00:00Z')});
  await page.goto('http://127.0.0.1:3007/?view=toolkit&task=email');
  await expect(page.getByRole('button',{name:'Copy work prompt',exact:true})).toBeVisible();
  await expect(page.getByRole('tab',{name:'Practise with an example'})).toHaveCount(0);
  await page.getByRole('button',{name:'Save',exact:true}).click(); await page.getByRole('button',{name:'Mark as used at work'}).click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('smarter-work:2026:business')!));
  expect(stored['business-04']).toEqual({opened:false,tried:false,saved:true,used:true});
  await page.goto('http://127.0.0.1:3007/?track=business&day=4');
  await expect(page.getByText('A little anticipation.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Copy work prompt',exact:true})).toHaveCount(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button',{name:'Available December 24'})).toBeDisabled();
});

test('new views and work panels fit narrow screens and keyboard tabs work',async({page})=>{
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    for(const path of ['/?view=discover','/?view=saved','/?view=toolkit','/?view=toolkit&task=email','/?track=guided&day=10']) {
      await page.goto(path); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(await page.locator('dialog').count()) expect(await page.locator('.lesson-scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    }
  }
  await page.goto('/?track=business&day=4'); await page.getByRole('tab',{name:'Use it for my work'}).focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Practise with an example'})).toBeFocused(); await page.keyboard.press('End'); await expect(page.getByRole('tab',{name:/Practice materials/})).toBeFocused();
});
