import type {Page} from '@playwright/test';

export async function enterPortfolio(page:Page,path='/'){
 await page.goto(path);
 await page.waitForSelector('.loading-screen',{state:'detached',timeout:5000}).catch(()=>{});
}

/** Horizontal extent of the settled figure inside a 16:9 film plate, using the
 * matte's final bounding box. The plate itself is allowed to be wider than a
 * phone screen because everything outside the subject is transparent. */
export async function subjectExtent(page:Page,selector='.entrance-figure'){
 return page.locator(selector).evaluate((v:HTMLVideoElement)=>{const r=v.getBoundingClientRect();return {left:r.left+.431*r.width,right:r.left+.568*r.width,ratio:r.width/r.height};});
}

export const gutter=(page:Page)=>page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.wrap')!).paddingLeft));
