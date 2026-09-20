import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers';
async function ready(page:any){await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-character','alpha');}
for(const width of [390,1440])test(`transparent packed film and full body at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await ready(page);
 const video=page.locator('.entrance-figure');await expect(video).toHaveAttribute('src','/assets/kiran-studio-alpha-desktop.mp4');
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
 expect(await video.evaluate((v:HTMLVideoElement)=>[v.videoWidth,v.videoHeight])).toEqual([3840,1080]);
 const decoded=await video.evaluate(async(v:HTMLVideoElement)=>{
  await new Promise<void>(resolve=>{v.addEventListener('seeked',()=>resolve(),{once:true});v.currentTime=9.8;});
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext('2d')!;ctx.drawImage(v,0,0);
  const sample=(x:number,y:number)=>[...ctx.getImageData(Math.floor(x*c.width),Math.floor(y*c.height),1,1).data].slice(0,3);
  return {ratio:c.width/c.height,bg:sample(.90,.65),floor:sample(.78,.98),face:sample(.75,.16),suit:sample(.75,.45),playing:!v.paused};
 });
 expect(decoded.ratio).toBeCloseTo(32/9,2);expect(Math.max(...decoded.bg)).toBeLessThan(6);expect(Math.max(...decoded.floor)).toBeLessThan(6);expect(Math.min(...decoded.face)).toBeGreaterThan(245);expect(Math.min(...decoded.suit)).toBeGreaterThan(245);expect(decoded.playing).toBe(false);
 const b=await video.boundingBox();expect(b!.width/b!.height).toBeCloseTo(16/9,2);
 await page.locator('#tie-adjust').scrollIntoViewIfNeeded();await expect(page.locator('#tie-adjust')).toHaveAttribute('data-character','alpha');
 await expect(page.locator('.tie-figure')).toHaveAttribute('src','/assets/kiran-tie-alpha-desktop.mp4');
 await page.getByRole('button',{name:'Replay tie adjustment'}).click();await expect.poll(()=>page.locator('.tie-figure').evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
});
test('packed media failure recovers with original RGB without exposing the mask',async({page})=>{
 await page.route('**/assets/kiran-studio-alpha-*.mp4',route=>route.abort());await enterPortfolio(page);
 const video=page.locator('.entrance-figure');await expect(video).toHaveAttribute('src','/assets/kiran-studio-desktop.mp4');await expect(page.locator('#intro')).toHaveAttribute('data-webgl','fallback');await expect(video).toHaveCSS('opacity','1');
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);await page.getByRole('button',{name:'Pause',exact:true}).click();expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
});
test('context loss retains playback time and opt-in sound using original media',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await ready(page);const video=page.locator('.entrance-figure');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.5);
 if(await video.evaluate((v:HTMLVideoElement)=>v.muted))await page.getByRole('button',{name:'Turn sound on'}).click();expect(await video.evaluate((v:HTMLVideoElement)=>v.muted)).toBe(false);await page.getByRole('button',{name:'Pause',exact:true}).click();const t=await video.evaluate((v:HTMLVideoElement)=>v.currentTime);
 await page.locator('.webgl-studio').evaluate((c:HTMLCanvasElement)=>c.getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
 await expect(video).toHaveAttribute('src','/assets/kiran-studio-desktop.mp4');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThanOrEqual(2);
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeCloseTo(t,1);expect(await video.evaluate((v:HTMLVideoElement)=>v.paused&&!v.muted)).toBe(true);await expect(page.locator('#intro')).toHaveAttribute('data-webgl','fallback');
});
