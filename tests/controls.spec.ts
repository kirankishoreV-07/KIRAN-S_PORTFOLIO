import { test, expect, type Page } from '@playwright/test';
import { enterPortfolio } from './helpers';

const top = (page: Page, id: string) => page.evaluate((id) => Math.round(document.getElementById(id)!.getBoundingClientRect().top), id);
const settle = (page: Page) => page.waitForTimeout(1900);

test.describe('every control does what it says', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await enterPortfolio(page);
  });

  test('header, scene index and footer links land exactly on their scenes', async ({ page }) => {
    test.setTimeout(90000);
    for (const [name, id] of [['Journey', 'journey'], ['Experience', 'experience'], ['Work', 'work'], ['Contact', 'contact']] as const) {
      await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).click();
      await settle(page);
      expect(Math.abs(await top(page, id))).toBeLessThanOrEqual(2);
      await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    }
    for (const id of ['intro', 'journey', 'experience', 'work', 'toolkit', 'interests', 'contact']) {
      await page.locator(`.scene-rail a[href="#${id}"]`).click();
      await settle(page);
      expect(Math.abs(await top(page, id))).toBeLessThanOrEqual(2);
    }
    for (const link of [page.locator('footer a', { hasText: 'Back to top' }), page.locator('footer .brand-name'), page.locator('.brand')]) {
      await page.mouse.wheel(0, 40000); await settle(page);
      await link.click(); await settle(page);
      expect(await page.evaluate(() => Math.round(scrollY))).toBeLessThanOrEqual(1);
    }
    await page.locator('.hero .primary-button').click(); await settle(page);
    expect(Math.abs(await top(page, 'work'))).toBeLessThanOrEqual(2);
  });

  test('downloads, mail, copy and external links are real', async ({ page }) => {
    const resumes = page.locator('a[href="/assets/kiran-resume.pdf"]');
    expect(await resumes.count()).toBeGreaterThanOrEqual(3);
    for (const el of await resumes.all()) await expect(el).toHaveAttribute('download', '');
    const pdf = await page.request.get('/assets/kiran-resume.pdf');
    expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
    await expect(page.locator('a[href^="mailto:kiransjobs7@gmail.com"]')).toHaveCount(3);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.locator('.copy-status')).toHaveText(/copied|copy it/);
    for (const a of await page.locator('a[target="_blank"]').all()) {
      const href = await a.getAttribute('href');
      expect(href).toMatch(/^(https:\/\/|\/assets\/)/);
      await expect(a).toHaveAttribute('rel', /noreferrer/);
    }
  });

  test('motion toggle, project navigation and case files respond', async ({ page }) => {
    const toggle = page.locator('.motion-toggle');
    await toggle.click(); await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click(); await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await page.locator('.hero .primary-button').click(); await settle(page);
    await page.locator('.project-nav button').nth(3).click(); await settle(page);
    await expect(page.locator('.project-nav button').nth(3)).toHaveAttribute('aria-current', 'true');
    await page.locator('#vsyk .project-actions button').click();
    await expect(page.locator('#case-title')).toHaveText('VSYK Chits');
    await page.locator('.case-index a', { hasText: 'Scope & limitations' }).click();
    await expect.poll(() => page.locator('#case-limitations').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(200);
    await page.locator('.case-next-button').click();
    await expect(page.locator('#case-title')).toHaveText('Joulet');
    await expect(page).toHaveURL(/#case\/joulet$/);
    await page.getByRole('button', { name: 'Close case study' }).click();
    await expect(page.locator('dialog')).toHaveCount(0);
  });

  test('film controls and chapter tabs respond', async ({ page }) => {
    const intro = page.locator('.entrance-figure');
    await expect.poll(() => intro.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
    await expect(page.locator('.hero .intro-controls')).toHaveCSS('opacity', '1');
    await page.waitForTimeout(300);
    await page.locator('.hero .play-button').click();
    await expect.poll(() => intro.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.getByRole('button', { name: 'Replay introduction' }).click();
    await expect.poll(() => intro.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    const sound = page.locator('.hero .sound-button');
    const before = await sound.getAttribute('aria-pressed');
    await sound.click(); await expect(sound).not.toHaveAttribute('aria-pressed', before!);

    const tie = page.locator('.tie-figure');
    await page.locator('#tie-adjust').scrollIntoViewIfNeeded();
    await expect.poll(() => tie.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
    await page.getByRole('button', { name: 'Pause tie film' }).click();
    await expect.poll(() => tie.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.getByRole('button', { name: 'Play tie film' }).click();
    await expect.poll(() => tie.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    await page.getByRole('button', { name: 'Replay tie adjustment' }).click();
    await expect.poll(() => tie.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2);

    await page.locator('.brand').click(); await settle(page);
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Journey' }).click(); await settle(page);
    await page.locator('#journey').getByRole('tab').nth(2).click(); await settle(page);
    await expect(page.locator('#journey').getByRole('tabpanel')).toContainText('Amrita');
  });
});

test('mobile menu opens, navigates, closes and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterPortfolio(page);
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(page.locator('#site-menu')).toBeVisible();
  await page.locator('#site-menu a', { hasText: 'Toolkit' }).click();
  await expect(page.locator('#site-menu')).toBeHidden();
  await page.waitForTimeout(1500);
  expect(Math.abs(await top(page, 'toolkit'))).toBeLessThanOrEqual(2);
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-menu')).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('button', { name: 'Close menu' }).click();
  await expect(page.locator('#site-menu')).toBeHidden();
});
