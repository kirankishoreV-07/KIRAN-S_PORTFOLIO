import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('toolkit lays out every category and tool at once',async({page})=>{
 await page.goto('/#toolkit');
 await expect(page.locator('#toolkit .tool-group')).toHaveCount(6);
 for(const name of ['Languages','AI & Computer Vision','Generative AI & Agents','Backend, Web & Data','Cloud & DevOps','Tools & Platforms'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
 await expect(page.locator('#toolkit .tool')).toHaveCount(47);
 await expect(page.locator('#toolkit')).toContainText('PyTorch');await expect(page.locator('#toolkit')).toContainText('AWS Lambda');
});
test('method shows every step with its output and every open question',async({page})=>{
 await page.goto('/#interests');
 await expect(page.locator('.process-step')).toHaveCount(4);
 for(const step of ['Understand','Prototype','Validate','Deliver'])await expect(page.getByRole('heading',{name:step,exact:true})).toBeVisible();
 await expect(page.locator('.process-output').nth(2)).toContainText('Evidence');
 await expect(page.locator('.question')).toHaveCount(5);await expect(page.locator('.question').first()).toContainText('Lazarus');
});
for(const width of [390,768,1440])test(`redesigned sections remain accessible at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#experience');
 for(const id of ['journey','experience','work','toolkit','interests','contact']){
  await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(80);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('#'+id).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,message:n.any.map(a=>a.message)}))}))).toEqual([]);
 }
 await expect(page.locator('.hero-roles li')).toHaveCount(4);
 await expect(page.locator('.finalist')).toHaveCount(4);
});
test('credentials link to official verification and the end title is complete',async({page})=>{
 await page.goto('/#experience');
 const cards=page.locator('.cred-card');await expect(cards).toHaveCount(3);
 await expect(page.locator('.cred-actions a',{hasText:'Verify on Credly'}).first()).toHaveAttribute('href','https://www.credly.com/badges/eedd31e6-fcfb-464d-85fa-26ec5571b8df/public_url');
 await expect(page.locator('.cred-actions a',{hasText:'Verify on Credly'}).nth(1)).toHaveAttribute('href','https://www.credly.com/badges/0b626870-1608-49a7-a3f2-e3c85dc56bd8/public_url');
 await expect(page.locator('.cred-actions a',{hasText:'Verify on Cyfrin'})).toHaveAttribute('href','https://profiles.cyfrin.io/u/kirankishore07/achievements/blockchain-basics');
 for(const pdf of ['aws-ai-practitioner','aws-cloud-practitioner']){const r=await page.request.get(`/assets/credentials/${pdf}-certificate.pdf`);expect(r.ok()).toBe(true);expect((await r.body()).subarray(0,4).toString()).toBe('%PDF');}
 await expect(page.locator('#site-footer')).not.toContainText('Built with');
 expect(await page.locator('.wm-char').allTextContents()).toEqual([...'KiranKishore']);
});
