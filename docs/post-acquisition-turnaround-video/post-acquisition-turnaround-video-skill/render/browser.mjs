// Launches a headless Chromium for the renderer, the audit and the artifact screenshots, whatever the machine:
// $CHROMIUM_PATH, then an installed Chrome or Edge, then a sandbox Chromium (/opt/pw-browsers), then
// Playwright's own download (`npx playwright install chromium`).
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';

export async function launch(args = []) {
  const tries = [];
  if (process.env.CHROMIUM_PATH) tries.push({ executablePath: process.env.CHROMIUM_PATH });
  tries.push({ channel: 'chrome' }, { channel: 'msedge' });
  for (const base of ['/opt/pw-browsers']) {
    if (!existsSync(base)) continue;
    for (const d of readdirSync(base).filter(n => n.startsWith('chromium'))) {
      for (const p of [`${base}/${d}/chrome-linux/chrome`, `${base}/${d}/chrome-linux64/chrome`]) if (existsSync(p)) tries.push({ executablePath: p });
    }
  }
  tries.push({});
  let last;
  for (const o of tries) {
    try { return await chromium.launch({ headless: true, args, ...o }); } catch (e) { last = e; }
  }
  throw new Error('No Chrome or Chromium found. Install Chrome, set CHROMIUM_PATH, or run `npx playwright install chromium` in render/.\n' + (last && last.message));
}
