// Visual check of the running dev server: both themes, desktop and phone.
// Needs the site at http://127.0.0.1:4321/ (astro dev --background --host 127.0.0.1).
// Writes screenshots to .verify/ and exits with 1 on console errors or horizontal overflow.
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';

const BASE = process.env.SITE ?? 'http://127.0.0.1:4321';
const EDGE = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => p && existsSync(p));
if (!EDGE) throw new Error('No Edge/Chrome found, set BROWSER=path');

try {
  await fetch(BASE);
} catch {
  console.error(`Site is not running at ${BASE}. Start it: astro dev --background --host 127.0.0.1`);
  process.exit(1);
}

mkdirSync('.verify', { recursive: true });
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true } };
const problems = [];

for (const lang of ['', 'en']) {
  for (const theme of ['dark', 'light']) {
    for (const [name, viewport] of Object.entries(sizes)) {
      const tag = `${lang || 'ru'}-${theme}-${name}`;
      const page = await browser.newPage();
      await page.setViewport(viewport);
      await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme);
      page.on('pageerror', (e) => problems.push(`${tag}: pageerror ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && problems.push(`${tag}: console ${m.text()}`));
      await page.goto(`${BASE}/${lang ? lang + '/' : ''}`, { waitUntil: 'domcontentloaded' });
      //       // the cover mounts after hydration, so wait for it to appear first, then to go away
      await page.waitForSelector('div.fixed.inset-0.z-40', { timeout: 15000 }).catch(() => {});
      await page.waitForFunction(() => !document.querySelector('div.fixed.inset-0.z-40'), { timeout: 30000 }).catch(() => problems.push(`${tag}: loader never closed`));
      await new Promise((r) => setTimeout(r, 6000));
      await page.screenshot({ path: `.verify/${tag}-hero.png` });
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, document.querySelector('#works').offsetTop);
      });
      await new Promise((r) => setTimeout(r, 2500));
      await page.screenshot({ path: `.verify/${tag}-works.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`${tag}: horizontal overflow ${overflow}px`);
      await page.close();
    }
  }
}

// "squint" copies: the hero at a quarter of its size, to judge whether the picture reads from a distance
const sq = await browser.newPage();
await sq.setViewport({ width: 720, height: 450 });
for (const theme of ['dark', 'light']) {
  const data = readFileSync(`.verify/ru-${theme}-desktop-hero.png`).toString('base64');
  await sq.setContent(`<body style="margin:0"><img style="width:720px" src="data:image/png;base64,${data}"></body>`);
  await sq.screenshot({ path: `.verify/squint-${theme}.png` });
}

await browser.close();
if (problems.length) {
  console.error('PROBLEMS:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('verify ok: screenshots in .verify/ (look at them before reporting)');
