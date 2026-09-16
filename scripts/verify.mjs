import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && !message.text().includes('fonts.googleapis')) errors.push(message.text()); });
const base = process.env.POLARIS_TEST_URL || 'http://127.0.0.1:4173';
async function oceanUniforms() {
  return page.evaluate(async () => {
    const source = performance.getEntriesByType('resource').map(entry => entry.name).find(name => name.includes('/@react-three_fiber.js'));
    if (!source) throw new Error('Cannot inspect the development renderer.');
    const { _roots } = await import(source);
    const root = _roots.get(document.querySelector('canvas'));
    let result;
    root.store.getState().scene.traverse(object => {
      const uniforms = object.material?.uniforms;
      if (uniforms?.uEye && uniforms?.uTime) result = { time: uniforms.uTime.value, dawn: uniforms.uDawn.value, danger: uniforms.uDanger.value };
    });
    return result;
  });
}
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.boot-screen').waitFor({ state: 'detached', timeout: 25000 });
  await page.waitForTimeout(4500);
  if (await page.locator('.render-notice').count()) throw new Error('Desktop WebGL fell back to simplified rendering.');
  await page.screenshot({ path: 'artifacts/01-desktop-hero.png' });
  const inspect = await page.evaluate(() => ({ canvas: !!document.querySelector('canvas'), chapters: document.querySelectorAll('[data-chapter]').length, overflow: document.documentElement.scrollWidth > innerWidth }));
  if (!inspect.canvas || inspect.chapters !== 14 || inspect.overflow) throw new Error(`Unexpected desktop state: ${JSON.stringify(inspect)}`);
  const oceanStart = await oceanUniforms();
  await page.waitForTimeout(200);
  const oceanLater = await oceanUniforms();
  if (!oceanStart || oceanLater.time <= oceanStart.time) throw new Error('Ocean time is not reaching the live GPU material.');
  for (const [id, file] of [['detection', '02-scan'], ['satellite', '02b-orbit'], ['conflict', '03-conflict'], ['escape', '04-passage'], ['twin', '05-twin']]) {
    await page.evaluate(id => window.scrollTo(0, document.getElementById(id).offsetTop), id);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `artifacts/${file}.png` });
    if (id === 'satellite') {
      const orbital = await page.evaluate(async () => {
        const source = performance.getEntriesByType('resource').map(entry => entry.name).find(name => name.includes('/@react-three_fiber.js'));
        const { _roots } = await import(source);
        const scene = _roots.get(document.querySelector('canvas')).store.getState().scene;
        const globe = scene.getObjectByName('polar-orbital-view');
        return { globe: globe.visible, surface: scene.getObjectByName('antarctic-surface').visible, landVertices: globe.children[1].geometry.attributes.position.count };
      });
      if (!orbital.globe || orbital.surface || orbital.landVertices < 100) throw new Error(`Orbital geometry did not resolve: ${JSON.stringify(orbital)}`);
    }
  }
  await page.locator('#twin').getByRole('button', { name: 'Rotate', exact: true }).click();
  if (await page.locator('#twin').getByRole('button', { name: 'Rotate', exact: true }).getAttribute('aria-pressed') !== 'true') throw new Error('Orbit control did not activate.');
  await page.locator('#twin').getByRole('button', { name: 'Icebergs', exact: true }).click();
  if (await page.locator('#twin').getByRole('button', { name: 'Icebergs', exact: true }).getAttribute('aria-pressed') !== 'false') throw new Error('Iceberg layer did not toggle.');
  await page.locator('#twin').getByRole('button', { name: 'Icebergs', exact: true }).click();
  await page.locator('.command-button').click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Select IBG-002' }).click();
  if (!(await page.locator('.command-grid h3').textContent()).includes('IBG-002')) throw new Error('Object inspector did not update.');
  await page.getByRole('button', { name: 'Eastern passage' }).click();
  await page.waitForTimeout(350);
  await page.getByLabel('Vessel ice class').selectOption('PC7');
  await expect(page.getByRole('button', { name: 'Approve demo route' })).toBeDisabled();
  await page.getByRole('button', { name: 'Western passage' }).click();
  await page.getByRole('button', { name: 'Approve demo route' }).click();
  await expect(page.locator('.approval-gate [role="status"]')).toContainText('DEMO APPROVED');
  await page.getByLabel('Observation age', { exact: true }).focus();
  await page.keyboard.press('End');
  await expect(page.getByLabel('Observation age', { exact: true })).toHaveValue('48');
  await expect(page.locator('.approval-gate [role="status"]')).toContainText('AWAITING');
  await page.getByLabel('Forecast horizon', { exact: true }).focus();
  await page.keyboard.press('End');
  await expect(page.getByLabel('Forecast horizon', { exact: true })).toHaveValue('24');
  await page.getByRole('button', { name: 'Connected demo' }).click();
  if (!(await page.getByRole('button', { name: 'Cached-data demo' }).getAttribute('aria-pressed') === 'true')) throw new Error('Cached-data mode failed.');
  await page.getByRole('button', { name: 'Current-assisted passage' }).click();
  await page.getByRole('button', { name: 'Why data age matters', exact: true }).click();
  await page.locator('.command-content').evaluate(element => element.parentElement.scrollTo(0, 0));
  await page.waitForTimeout(350);
  await page.screenshot({ path: 'artifacts/06-command-center.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('tab', { name: 'Find the passage' }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await page.getByRole('tab', { name: 'Find the passage' }).click();
  if (!(await page.getByRole('tabpanel').textContent()).includes('A*')) throw new Error('Architecture content did not update.');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'artifacts/06b-blueprint.png' });
  await page.evaluate(() => window.scrollTo(0, document.getElementById('simulation').offsetTop));
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: 'Storm + iceberg' }).click();
  await page.getByRole('button', { name: 'Run simulation', exact: true }).click();
  await page.getByRole('button', { name: 'Replay simulation' }).waitFor({ timeout: 10000 });
  if (!(await page.locator('.simulation-results').textContent()).includes('85')) throw new Error('Storm result did not resolve.');
  await page.screenshot({ path: 'artifacts/07-simulator.png' });
  await page.getByRole('button', { name: 'Signal blackout' }).click();
  if (!(await page.locator('.simulation-results').textContent()).includes('—')) throw new Error('Scenario change did not reset result.');
  await page.evaluate(() => window.scrollTo(0, document.getElementById('horizon').offsetTop));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: 'artifacts/08-sunrise.png' });
  const sunrise = await oceanUniforms();
  // At the chapter entrance the sunrise is ~90% complete; it finishes during the final scroll.
  if (sunrise.dawn < .85) throw new Error(`Sunrise uniform did not transition: ${sunrise.dawn}`);
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, reducedMotion: 'reduce' });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(base, { waitUntil: 'networkidle' });
  await mobile.locator('.boot-screen').waitFor({ state: 'detached', timeout: 25000 });
  await mobile.waitForTimeout(1000);
  await mobile.screenshot({ path: 'artifacts/09-mobile.png' });
  if (await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile has horizontal overflow.');
  await mobile.evaluate(() => window.scrollTo(0, document.getElementById('simulation').offsetTop));
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: 'artifacts/10-mobile-simulator.png' });
  await mobile.locator('.command-button').click();
  await expect(mobile.getByRole('dialog')).toBeVisible();
  await mobile.getByRole('button', { name: 'Current-assisted passage' }).click();
  await expect(mobile.getByRole('button', { name: 'Current-assisted passage' })).toHaveAttribute('aria-pressed', 'true');
  if (await mobile.getByRole('dialog').evaluate(element => element.scrollWidth > element.clientWidth)) throw new Error('Mobile decision studio has horizontal overflow.');
  await mobile.locator('.command-content').evaluate(element => element.parentElement.scrollTo(0, 0));
  await mobile.screenshot({ path: 'artifacts/11-mobile-studio.png' });
  await mobile.getByRole('button', { name: 'Close command center' }).click();
  await expect(mobile.getByRole('dialog')).toBeHidden();
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('PASS: WebGL, live GPU animation, orbital chapter, 14 chapters, responsive layout, layer controls, three route options, vessel threshold, approval/invalidation, forecast and data age, cached-data demo, architecture tabs, scenario replay, and reduced-motion mobile.');
  console.log('Screenshots written to artifacts/.');
} catch (error) {
  console.error('Captured browser errors:', errors);
  await page.screenshot({ path: 'artifacts/failure.png' }).catch(() => {});
  throw error;
} finally { await browser.close(); }
