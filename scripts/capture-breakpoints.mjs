/**
 * Capturas reproducibles del portal en los seis breakpoints del encargo.
 *
 * Playwright NO es dependencia del proyecto a propósito: el Dockerfile ejecuta
 * `npm ci` y descargar Chromium encarecería el build de producción. Se invoca
 * bajo demanda:
 *
 *   npx --yes playwright@1.56.0 install chromium
 *   BASE_URL=http://127.0.0.1:3210 OUT=docs/screenshots/antes node scripts/capture-breakpoints.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3210';
const OUT = process.env.OUT || 'docs/screenshots/antes';
const FULL = process.env.FULL_PAGE !== '0';

export const BREAKPOINTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024, label: 'tablet' },
  { name: '390x844', width: 390, height: 844, label: 'movil', mobile: true }
];

const ROUTES = [
  { slug: 'portada', url: '/' },
  { slug: 'admin', url: '/admin/', auth: true },
  { slug: 'admin-biblioteca-visual', url: '/admin/', auth: true, tab: 'Biblioteca visual' }
];

// Credenciales del servidor local de pruebas, no de producción. Se usan para
// que las capturas del panel muestren el panel y no la pantalla de acceso.
const ADMIN_USER = process.env.ADMIN_USER || 'editor';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function resolvePlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [];
  if (process.env.PLAYWRIGHT_MODULE) candidates.push(process.env.PLAYWRIGHT_MODULE);
  candidates.push('playwright', 'playwright-core', '@playwright/test');
  for (const id of candidates) {
    try { return require(id); } catch {}
  }
  throw new Error(
    'Playwright no está disponible. Ejecuta:\n' +
    '  npx --yes playwright@1.56.0 install chromium\n' +
    'y vuelve a lanzar este script con npx, por ejemplo:\n' +
    '  npx --yes -p playwright@1.56.0 node scripts/capture-breakpoints.mjs'
  );
}

async function waitForContent(page) {
  // El portal se pinta desde /api/public/content: esperar a que el hero tenga texto real.
  await page.waitForFunction(
    () => {
      const h = document.getElementById('heroTitle');
      const stat = document.getElementById('statResources');
      return h && h.textContent.trim().length > 0 && stat && stat.textContent.trim() !== '0';
    },
    { timeout: 15000 }
  ).catch(() => {});
  await page.evaluate(async () => {
    // Forzar la carga de imágenes diferidas recorriendo la página.
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    // Límite obligatorio: una imagen diferida que nunca entra en el viewport se
    // queda con complete=false para siempre, y esperarla cuelga la captura.
    const pending = [...document.images].filter(i => !i.complete).map(i =>
      new Promise(r => {
        i.addEventListener('load', r, { once: true });
        i.addEventListener('error', r, { once: true });
      })
    );
    await Promise.race([
      Promise.all(pending),
      new Promise(r => setTimeout(r, 4000))
    ]);
    await new Promise(r => setTimeout(r, 300));
  });
}

async function main() {
  const { chromium } = resolvePlaywright();
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`Capturando ${BASE} -> ${OUT}`);

  // Si no hay Chromium descargado por Playwright, se usa el Chrome o Edge ya
  // instalados: descargar 250 MB solo para tomar capturas no compensa.
  const launchOptions = {};
  if (process.env.BROWSER_PATH) launchOptions.executablePath = process.env.BROWSER_PATH;
  else if (process.env.BROWSER_CHANNEL) launchOptions.channel = process.env.BROWSER_CHANNEL;

  let browser;
  try {
    browser = await chromium.launch(launchOptions);
  } catch (error) {
    for (const channel of ['chrome', 'msedge']) {
      try { browser = await chromium.launch({ channel }); break; } catch {}
    }
    if (!browser) throw error;
  }
  const written = [];

  for (const bp of BREAKPOINTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
        deviceScaleFactor: 1,
        isMobile: !!bp.mobile,
        hasTouch: !!bp.mobile,
        locale: 'es-CL'
      });
      const page = await context.newPage();
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));

      if (route.auth && ADMIN_PASSWORD) {
        const login = await context.request.post(BASE + '/api/auth/login', {
          data: { user: ADMIN_USER, password: ADMIN_PASSWORD }
        });
        if (!login.ok()) console.warn(`  (acceso al panel rechazado: ${login.status()}; se captura la pantalla de acceso)`);
      }

      // `networkidle` se cuelga en este portal; `domcontentloaded` más esperas
      // explícitas sobre el contenido real es más fiable y más rápido.
      await page.goto(BASE + route.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (route.slug === 'portada') await waitForContent(page);
      else await page.waitForTimeout(1800);

      if (route.tab) {
        const tab = page.locator(`nav button:has-text("${route.tab}")`).first();
        if (await tab.count()) { await tab.click(); await page.waitForTimeout(2200); }
      }

      const file = path.join(OUT, `${route.slug}-${bp.name}.png`);
      process.stdout.write('');
      await page.screenshot({ path: file, fullPage: FULL && route.slug !== 'admin' });
      written.push({ file, breakpoint: bp.name, route: route.url, consoleErrors: errors });
      console.log(`· ${file}${errors.length ? `  (${errors.length} error/es de consola)` : ''}`);
      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'capturas.json'), JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, shots: written }, null, 2) + '\n');
}

// Solo se ejecuta al invocarlo directamente: verify-visual.mjs importa
// BREAKPOINTS de este módulo y no debe disparar una tanda de capturas.
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) main().catch(e => { console.error(e.message); process.exitCode = 1; });
