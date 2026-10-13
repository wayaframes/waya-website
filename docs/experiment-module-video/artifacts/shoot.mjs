// Screenshots the artifact pages (the "real" landing page and survey report) for the video.
//   node shoot.mjs           -> landing.png (1440x900) and survey.png (1440x900) in this folder
import { chromium } from '../render/node_modules/playwright-core/index.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [file, out] of [['critical-character-landing.html', 'landing.png'], ['critical-character-survey.html', 'survey.png'], ['chatgpt-flattery.html', 'chatgpt.png']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(resolve(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(here, out), type: 'png' });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
