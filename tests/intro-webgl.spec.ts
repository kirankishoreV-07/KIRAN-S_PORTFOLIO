import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers';
test('WebGL renders above CSS resolution within a 4K cap and keeps the full frame',async({page})=>{
 await page.setViewportSize({width:390,height:844});await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','ready');
 await expect(page.getByRole('heading',{level:1})).toHaveAccessibleName('Hi, I’m Kiran Kishore');
 const sizes=await page.locator('.webgl-studio').evaluate((c:HTMLCanvasElement)=>({buffer:c.width,bufferHeight:c.height,css:c.getBoundingClientRect().width}));
 expect(sizes.buffer).toBeGreaterThan(sizes.css);expect(sizes.buffer).toBeLessThanOrEqual(3840);expect(sizes.bufferHeight).toBeLessThanOrEqual(2160);
 const video=page.locator('.entrance-figure');const frame=await video.boundingBox();expect(frame!.width/frame!.height).toBeCloseTo(16/9,2);expect(frame!.x).toBeGreaterThanOrEqual(-1);expect(frame!.x+frame!.width).toBeLessThanOrEqual(391);
 await expect(page.locator('.hero-role')).toContainText('Backend & Cloud Developer');
 await expect(page.locator('.role-item')).toHaveCount(4);
});
test('WebGL creation failure keeps the original playable HTML film',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2')return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
 await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','fallback');await expect(page.locator('.webgl-studio')).toHaveCount(0);
 await expect(page.locator('.entrance-figure')).toHaveCSS('opacity','1');await expect.poll(()=>page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 await page.getByRole('button',{name:'Pause',exact:true}).click();expect(await page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await expect(page.locator('.primary-button')).toBeVisible();await expect(page.locator('.resume-link')).toBeVisible();
});
test('context loss reveals film and stops WebGL rendering',async({page})=>{
 await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','ready');
 await page.locator('.webgl-studio').evaluate((canvas:HTMLCanvasElement)=>{canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();});
 await expect(page.locator('#intro')).toHaveAttribute('data-webgl','fallback');await expect(page.locator('.entrance-figure')).toHaveCSS('opacity','1');await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
 const frames=await page.locator('#intro').getAttribute('data-frames');await page.waitForTimeout(250);expect(await page.locator('#intro').getAttribute('data-frames')).toBe(frames);
 await page.getByRole('button',{name:'Replay introduction'}).click();await expect.poll(()=>page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>!v.paused)).toBe(true);
});
test('reduced motion is a still poster; manual film stops rendering when paused',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','ready');await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
 expect(await page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBe(0);
 await expect.poll(()=>page.locator('.entrance-figure').evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
 const frames=await page.locator('#intro').getAttribute('data-frames');await page.waitForTimeout(250);expect(await page.locator('#intro').getAttribute('data-frames')).toBe(frames);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#intro')).toHaveAttribute('data-rendering','running');await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
});
test('offscreen and hidden stop renderer; toggle cleans canvas instances',async({page})=>{
 await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','ready');
 for(let i=0;i<4;i++){await page.locator('.motion-toggle').click();await expect(page.locator('.webgl-studio')).toHaveCount(1);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','ready');}
 await page.locator('#toolkit').scrollIntoViewIfNeeded();await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');const frames=await page.locator('#intro').getAttribute('data-frames');await page.waitForTimeout(250);expect(await page.locator('#intro').getAttribute('data-frames')).toBe(frames);
 await page.locator('#intro').scrollIntoViewIfNeeded();await expect(page.locator('#intro')).toHaveAttribute('data-rendering','running');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#intro')).toHaveAttribute('data-rendering','paused');
});
