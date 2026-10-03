import {test,expect} from '@playwright/test';
test('the slate opens onto the title, profession and film in one sequence',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/');
 await expect(page.locator('.loader')).toBeVisible();expect(await page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBe(0);await expect(page.locator('main')).toHaveAttribute('inert','');
 await expect(page.locator('.loader')).toHaveCount(0,{timeout:6000});await expect(page.locator('main')).not.toHaveAttribute('inert','');
 await expect(page.locator('#intro')).toHaveAttribute('data-opening',/title|film|settled/);
 expect(await page.locator('.hero-name').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(160);
 await expect(page.locator('#intro')).toHaveAttribute('data-opening','settled',{timeout:6000});await expect.poll(()=>page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.5);
});
test('the stage re-lights per scene and the lights come up for the workshop',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/#experience');
 await expect(page.locator('html')).toHaveAttribute('data-scene','experience');await expect(page.locator('html')).toHaveAttribute('data-tone','dark');
 await page.goto('/#interests');await expect(page.locator('html')).toHaveAttribute('data-scene','interests');await expect(page.locator('html')).toHaveAttribute('data-tone','light');
 await page.goto('/#contact');await expect(page.locator('html')).toHaveAttribute('data-tone','dark');
 await expect(page.locator('.scene-rail a[aria-current=step]')).toContainText('Ready');
});
test('laptop journey scroll selects three factual chapters and releases',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/#journey');await expect(page.locator('#journey')).toHaveAttribute('data-pinned','true');
 expect((await page.locator('.journey-stage').boundingBox())!.height).toBeLessThanOrEqual(721);
 for(let i=0;i<3;i++){await page.locator('#journey').getByRole('tab').nth(i).click();await expect(page.locator('#journey').getByRole('tab').nth(i)).toHaveAttribute('aria-selected','true');await expect(page.locator('#journey').getByRole('tabpanel')).toContainText(i===0?'Geethaanjali':i===1?'Chaitanya':'Amrita');}
 await page.waitForTimeout(1400);await page.mouse.wheel(0,900);await page.waitForTimeout(1200);await expect(page.locator('#experience')).toBeInViewport();expect((await page.locator('.journey-stage').boundingBox())!.y).toBeLessThan(0);
});
test('laptop gallery stays bounded and all project actions remain reachable',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/#work');await expect(page.locator('#work')).toHaveClass(/is-horizontal/);expect((await page.locator('.work-stage').boundingBox())!.height).toBeLessThanOrEqual(721);
 const g=await page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.wrap')!).paddingLeft));
 for(let i=0;i<5;i++){await page.locator('.project-nav button').nth(i).click();await page.waitForTimeout(1500);const card=page.locator('.project-card').nth(i);const b=await card.boundingBox();expect(Math.abs(b!.x-g)).toBeLessThan(14);const action=await card.locator('.project-actions button').boundingBox();expect(action!.y+action!.height).toBeLessThan(721);}
 await page.mouse.wheel(0,500);await expect(page.locator('#toolkit')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(40000);
});
test('reduced-motion journey is a readable timeline with every chapter',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#journey');await expect(page.locator('#journey')).toHaveAttribute('data-pinned','false');
 for(const place of ['Geethaanjali','Chaitanya','Amrita'])await expect(page.locator('#journey .journey-card',{hasText:place})).toBeVisible();
 await expect(page.locator('#journey')).toContainText('CGPA');await expect(page.locator('#journey').getByRole('tab')).toHaveCount(0);
});
test('only the two character films own WebGL and they suspend outside view',async({page})=>{
 await page.goto('/');await page.waitForSelector('.loading-screen',{state:'detached',timeout:5000}).catch(()=>{});
 await expect(page.locator('#intro')).toHaveAttribute('data-rendering','running');
 await page.locator('#toolkit').scrollIntoViewIfNeeded();await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
 await page.locator('#tie-adjust').scrollIntoViewIfNeeded();await expect(page.locator('canvas')).toHaveCount(2);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#tie-adjust')).toHaveAttribute('data-rendering','paused');
});
