import {test,expect} from '@playwright/test';
import {enterPortfolio} from './helpers';
import AxeBuilder from '@axe-core/playwright';
const ids=['lazarus','sign-language','urbanpulse','vsyk','joulet'];
test('desktop bounded gallery reaches every project and exits to toolkit',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await enterPortfolio(page);await page.locator('.primary-button').click();
 await expect(page.locator('#work')).toHaveClass(/is-horizontal/);
 for(let i=0;i<5;i++){
  await page.locator('.project-nav button').nth(i).click();await page.waitForTimeout(700);
  const box=await page.locator('#'+ids[i]).boundingBox();expect(box!.x).toBeGreaterThanOrEqual(70);expect(box!.x).toBeLessThan(100);
  await page.locator('#'+ids[i]+' .project-actions button').click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);await expect(page.locator('#'+ids[i]+' .project-actions button')).toBeFocused();
 }
 await page.mouse.wheel(0,600);await page.waitForTimeout(700);await expect(page.locator('#toolkit')).toBeInViewport();
});
for(const width of [390,768,1440])test(`layout and accessibility at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});await enterPortfolio(page);await expect(page.locator('#intro')).toHaveAttribute('data-opening','settled');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('.project-card')).toHaveCount(5);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,message:n.any.map(a=>a.message)}))}))).toEqual([]);
 await page.locator('.primary-button').click();await page.waitForTimeout(600);
 const workResults=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(workResults.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,message:n.any.map(a=>a.message)}))}))).toEqual([]);
});
test('reduced motion, explicit toggle, resizing and 200% text',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await enterPortfolio(page);await expect(page.locator('#work')).not.toHaveClass(/is-horizontal/);
 await page.locator('#joulet').scrollIntoViewIfNeeded();await expect(page.locator('#joulet')).toBeInViewport();
 await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.locator('#work')).toHaveClass(/is-horizontal/);
 await page.locator('.motion-toggle').click();await expect(page.locator('#work')).not.toHaveClass(/is-horizontal/);await page.reload();await expect(page.locator('.motion-toggle')).toHaveAttribute('aria-pressed','false');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{const nodes=[...document.querySelectorAll<HTMLElement>('p,a,button,h1,h2,h3,h4')];const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize));nodes.forEach((el,i)=>el.style.fontSize=sizes[i]*2+'px');});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('h1').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()].every(r=>r.right<=innerWidth)})).toBe(true);
});
test('direct links, keyboard dialog trap, résumé and contact',async({page})=>{
 await page.goto('/#toolkit');await page.waitForSelector('.loading-screen',{state:'detached',timeout:4000}).catch(()=>{});await expect(page.locator('#toolkit')).toBeInViewport();
 await page.goto('/#case/joulet');await page.waitForSelector('.loading-screen',{state:'detached',timeout:4000}).catch(()=>{});await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('#case-title')).toHaveText('Joulet');
 await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>document.activeElement?.closest('dialog')!==null)).toBe(true);
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);
 const response=await page.request.get('/assets/kiran-resume.pdf');expect(response.ok()).toBe(true);expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');
 await expect(page.locator('.email-link')).toHaveAttribute('href','mailto:kiransjobs7@gmail.com');
 await expect(page.getByRole('link',{name:'Instagram'})).toHaveAttribute('href','https://www.instagram.com/_kiran_kishore/');
 await expect(page.getByRole('link',{name:'X ↗'})).toHaveAttribute('href','https://x.com/kirann__77');
});
test('SignLink presents the supplied product UI and public-place use case',async({page})=>{
 await page.goto('/#case/sign-language');await page.waitForSelector('.loading-screen',{state:'detached',timeout:4000}).catch(()=>{});
 await expect(page.locator('#case-title')).toHaveText('SignLink');
 await expect(page.locator('.signlink-ui-gallery img')).toHaveCount(2);
 await expect(page.locator('.signlink-ui-gallery')).toContainText('busy public places');
 for(const asset of ['/assets/signlink-public-access.png','/assets/signlink-live-workspace.png'])expect((await page.request.get(asset)).ok()).toBe(true);
});
test('portrait and demo failure recover without blocking content',async({page})=>{
 await page.route('**/assets/kiran-studio-*.mp4',r=>r.abort());await page.route('**/assets/kiran-photo.jpeg',r=>r.abort());await page.route('**/assets/sign-demo.mp4',r=>r.abort());await enterPortfolio(page);await expect(page.locator('.portrait-missing')).toBeVisible();
 await page.goto('/#case/sign-language');await page.waitForSelector('.loading-screen',{state:'detached',timeout:4000}).catch(()=>{});await page.locator('.project-media video').evaluate((v:HTMLVideoElement)=>v.load());await expect(page.locator('.project-media')).toContainText('The demo could not load');
});
test('introduction starts automatically, replay restarts and leaving pauses',async({page})=>{
 await enterPortfolio(page);
 const film=page.locator('.entrance-figure');
 await expect(film).toHaveAttribute('src','/assets/kiran-studio-alpha-desktop.mp4');
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.3);
 const initiallyMuted=await film.evaluate((v:HTMLVideoElement)=>v.muted);
 await expect(page.getByRole('button',{name:initiallyMuted?'Turn sound on':'Mute sound'})).toBeVisible();
 expect(await film.evaluate((v:HTMLVideoElement)=>v.duration)).toBeGreaterThan(9);
 expect(await film.evaluate((v:HTMLVideoElement)=>v.duration)).toBeLessThan(11);
 await page.locator('.professional-media-controls').scrollIntoViewIfNeeded();
 if(await film.evaluate((v:HTMLVideoElement)=>v.paused))await page.getByRole('button',{name:'Play',exact:true}).click();
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await page.getByRole('button',{name:'Replay introduction'}).click();
 expect(await film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(1);
 await page.getByRole('link',{name:'View Work',exact:false}).click();
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await page.locator('#intro').scrollIntoViewIfNeeded();
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 expect(await film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(2);
});
test('reduced motion keeps the film still until explicit playback',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enterPortfolio(page);
 const film=page.locator('.entrance-figure');
 expect(await film.evaluate((v:HTMLVideoElement)=>v.paused&&v.currentTime===0)).toBe(true);
 await expect(page.locator('#work')).not.toHaveClass(/is-horizontal/);
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 expect(await film.evaluate((v:HTMLVideoElement)=>v.muted)).toBe(false);
});
test('failed film retains the original portrait and accessible project links',async({page})=>{
 await page.route('**/assets/kiran-studio-*.mp4',r=>r.abort());await enterPortfolio(page);
 await expect(page.locator('.portrait')).toBeVisible();
 await expect(page.locator('.sr-only[role=status]')).toContainText('Video unavailable');
 await expect(page.getByRole('button',{name:'Play',exact:true})).toBeDisabled();
 await expect(page.locator('.film-meta, .voice-note, .intro-transcript')).toHaveCount(0);
 await page.locator('.primary-button').click();
 await expect(page.locator('#work')).toBeInViewport();
});

test('mobile keeps the high-detail film, full frame and held ending',async({page})=>{
 await page.setViewportSize({width:390,height:844});await enterPortfolio(page);
 const film=page.locator('.entrance-figure');await expect(film).toHaveAttribute('src','/assets/kiran-studio-alpha-desktop.mp4');
 await film.scrollIntoViewIfNeeded();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 expect(await film.evaluate((v:HTMLVideoElement)=>!v.loop)).toBe(true);
 await film.evaluate((v:HTMLVideoElement)=>{v.currentTime=9.5;});await page.waitForTimeout(1000);
 expect(await film.evaluate((v:HTMLVideoElement)=>v.ended&&v.paused&&v.currentTime>9.9)).toBe(true);
 await expect(page.getByRole('button',{name:'Play again'})).toBeVisible();
 const videoBox=await film.boundingBox();expect(videoBox!.x).toBeGreaterThanOrEqual(-1);expect(videoBox!.x+videoBox!.width).toBeLessThanOrEqual(391);expect(videoBox!.width/videoBox!.height).toBeCloseTo(16/9,1);
 const endedTime=await film.evaluate((v:HTMLVideoElement)=>v.currentTime);await page.waitForTimeout(500);expect(await film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBe(endedTime);
});
test('tie-adjust sequence restarts when the experience section re-enters',async({page})=>{
 await enterPortfolio(page);const film=page.locator('.tie-figure');
 await page.locator('#experience').scrollIntoViewIfNeeded();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.2);
 await page.locator('#toolkit').scrollIntoViewIfNeeded();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await page.locator('#experience').scrollIntoViewIfNeeded();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 expect(await film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeLessThan(2);
});
test('motion toggle stops automatic playback, manual play remains available',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await enterPortfolio(page);const film=page.locator('.entrance-figure');
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 await page.locator('.motion-toggle').click();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
 await page.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>!v.paused)).toBe(true);
 await page.locator('.motion-toggle').click();await page.locator('.primary-button').click();await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
});
test('hiding the tab pauses the film',async({page})=>{
 await enterPortfolio(page);const film=page.locator('.entrance-figure');await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(.1);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
});
