import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('toolkit categories work by keyboard and expose the selected tools',async({page})=>{
 await page.goto('/#toolkit');
 const tabs=page.locator('.toolkit-nav [role=tab]');
 await tabs.first().focus();await page.keyboard.press('ArrowRight');
 await expect(tabs.nth(1)).toBeFocused();await expect(page.locator('#tool-panel')).toContainText('PyTorch');
 await tabs.nth(4).click();await expect(page.locator('#tool-panel')).toContainText('AWS Lambda');
 await expect(page.locator('#tool-panel')).not.toContainText('PyTorch');
});
test('process buttons update useful detail and interests expand',async({page})=>{
 await page.goto('/#interests');await page.locator('.process-track button').nth(2).click();
 await expect(page.locator('#process-detail h3')).toHaveText('Validate');
 await expect(page.locator('.process-output')).toContainText('Evidence');
 await page.locator('.interest-item summary').first().click();await expect(page.locator('.interest-item').first()).toHaveAttribute('open','');
});
for(const width of [390,768,1440])test(`redesigned sections remain accessible at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#experience');
 for(const id of ['experience','toolkit','interests','contact']){
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('#'+id).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 }
 await expect(page.locator('.role-directory .role-item')).toHaveCount(4);
 await expect(page.locator('.finalist-card')).toHaveCount(4);
});
