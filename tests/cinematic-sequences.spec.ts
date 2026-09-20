import {test,expect} from '@playwright/test';
test('loading hands off to the title, profession and film in one sequence',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/');
 await expect(page.locator('.cinematic-loader')).toBeVisible();expect(await page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBe(0);await expect(page.locator('main')).toHaveAttribute('inert','');
 await expect(page.locator('.cinematic-loader')).toHaveCount(0);await expect(page.locator('main')).not.toHaveAttribute('inert','');
 await expect(page.locator('#intro')).toHaveAttribute('data-opening',/title|film/);
 expect(await page.locator('h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThan(160);
 await expect(page.locator('#intro')).toHaveAttribute('data-opening','settled',{timeout:6000});await expect.poll(()=>page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.5);
});
test('laptop journey scroll selects three factual chapters and releases',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/#journey');await expect(page.locator('#journey')).toHaveClass(/journey-pinned/);
 expect((await page.locator('.journey-stage').boundingBox())!.height).toBeLessThanOrEqual(721);
 for(let i=0;i<3;i++){await page.locator('#journey').getByRole('tab').nth(i).click();await expect(page.locator('#journey').getByRole('tab').nth(i)).toHaveAttribute('aria-selected','true');await expect(page.locator('#journey').getByRole('tabpanel')).toContainText(i===0?'Geethaanjali':i===1?'Chaitanya':'Amrita');}
 await page.mouse.wheel(0,900);await page.waitForTimeout(400);await expect(page.locator('#experience')).toBeInViewport();expect((await page.locator('.journey-stage').boundingBox())!.y).toBeLessThan(0);
});
test('laptop gallery stays bounded and all project actions remain reachable',async({page})=>{
 await page.setViewportSize({width:1280,height:720});await page.goto('/#work');await expect(page.locator('#work')).toHaveClass(/is-horizontal/);expect((await page.locator('.work-stage').boundingBox())!.height).toBeLessThanOrEqual(721);
 for(let i=0;i<5;i++){await page.locator('.project-nav button').nth(i).click();await page.waitForTimeout(550);const card=page.locator('.project-card').nth(i);const b=await card.boundingBox();expect(b!.x).toBeGreaterThan(60);expect(b!.x).toBeLessThan(90);const action=await card.locator('.project-actions button').boundingBox();expect(action!.y+action!.height).toBeLessThan(721);}
 await page.mouse.wheel(0,500);await expect(page.locator('#toolkit')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBeLessThan(40000);
});
test('reduced-motion journey works by keyboard and geometry remains still',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#journey');await expect(page.locator('#journey')).not.toHaveClass(/journey-pinned/);await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-art','ready');
 await page.locator('#journey').getByRole('tab').first().focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#journey').getByRole('tab').nth(1)).toBeFocused();await expect(page.locator('#journey').getByRole('tabpanel')).toContainText('Chaitanya');
 await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-rendering','paused');await page.waitForTimeout(100);const frames=await page.locator('.scene-art-journey').getAttribute('data-frames');await page.waitForTimeout(250);expect(await page.locator('.scene-art-journey').getAttribute('data-frames')).toBe(frames);
});
test('journey context loss retains an original SVG poster and education controls',async({page})=>{
 await page.goto('/#journey');await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-art','ready');await page.locator('.scene-art-journey canvas').evaluate((c:HTMLCanvasElement)=>c.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext());await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-art','fallback');await expect(page.locator('.scene-art-journey .art-fallback')).toHaveCSS('opacity','1');await page.locator('#journey').getByRole('tab').nth(2).click();await expect(page.locator('#journey').getByRole('tabpanel')).toContainText('CGPA 8.06');
});
test('scene renderers suspend outside view and resume without extra canvases',async({page})=>{
 await page.goto('/#journey');await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-rendering','running');await expect(page.locator('.scene-art-work')).toHaveAttribute('data-rendering','paused');await page.locator('#contact').scrollIntoViewIfNeeded();await expect(page.locator('.scene-art-journey')).toHaveAttribute('data-rendering','paused');await expect(page.locator('.scene-art-work')).toHaveAttribute('data-rendering','paused');await expect(page.locator('.scene-art canvas')).toHaveCount(2);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
});
