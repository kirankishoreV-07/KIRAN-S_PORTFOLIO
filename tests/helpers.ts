import type {Page} from '@playwright/test';

export async function enterPortfolio(page:Page,path='/'){
 await page.goto(path);
 await page.waitForSelector('.loading-screen',{state:'detached',timeout:4000}).catch(()=>{});
}
