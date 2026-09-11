/**
 * Verificación visual y de accesibilidad en los seis breakpoints del encargo.
 *
 * Mide, no opina: contraste real de texto, objetivos táctiles, foco visible,
 * respeto de `prefers-reduced-motion`, desplazamiento horizontal, peso de
 * imágenes, CLS e imágenes sin dimensiones declaradas.
 *
 *   BASE_URL=http://127.0.0.1:3210 node scripts/verify-visual.mjs
 *
 * Requiere Playwright; ver la cabecera de scripts/capture-breakpoints.mjs.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { BREAKPOINTS } from './capture-breakpoints.mjs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3210';
const OUT = process.env.REPORT || 'docs/verificacion-visual.json';
const MIN_TARGET = 44;

function resolvePlaywright() {
  const require = createRequire(import.meta.url);
  const ids = [process.env.PLAYWRIGHT_MODULE, 'playwright', 'playwright-core'].filter(Boolean);
  for (const id of ids) { try { return require(id); } catch {} }
  throw new Error('Playwright no disponible.');
}

/* Contraste WCAG, calculado en el navegador sobre los colores realmente pintados. */
const CONTRAST_FN = `
(() => {
  const srgb = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => { const p = (c.match(/[\\d.]+/g) || []).slice(0, 3).map(Number); return 0.2126 * srgb(p[0]) + 0.7152 * srgb(p[1]) + 0.0722 * srgb(p[2]); };
  // Fondo efectivo. Si por el camino hay un degradado o una imagen de fondo, el
  // color pintado no se deduce del CSS: se marca para revisión manual en vez de
  // contarlo como fallo, porque dar por roto lo que funciona es tan inútil como
  // no medir.
  const opaque = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { gradient: true };
      const bg = cs.backgroundColor;
      const a = (bg.match(/[\\d.]+/g) || [])[3];
      if (bg && bg !== 'transparent' && (a === undefined || Number(a) > 0.85)) return { color: bg };
      n = n.parentElement;
    }
    return { color: 'rgb(255,255,255)' };
  };
  const ratio = (fg, bg) => { const a = lum(fg), b = lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };

  const results = [];
  const nodes = document.querySelectorAll('h1,h2,h3,p,a,button,small,strong,li,label,dd,dt,figcaption,span');
  for (const el of nodes) {
    const text = (el.textContent || '').trim();
    if (!text || el.children.length > 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.1) continue;
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const bg = opaque(el);
    const min = large ? 3 : 4.5;
    const entry = {
      text: text.slice(0, 60),
      selector: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
      color: cs.color,
      fontSize: Math.round(size),
      required: min
    };
    // Sobre degradado el color pintado no se deduce del CSS: revisión manual.
    if (bg.gradient) { entry.background = 'degradado o imagen'; entry.manual = true; results.push(entry); continue; }
    const c = ratio(cs.color, bg.color);
    if (c < min) { entry.background = bg.color; entry.ratio = Number(c.toFixed(2)); results.push(entry); }
  }
  return results;
})()`;

const TARGETS_FN = `
(() => {
  const small = [];
  for (const el of document.querySelectorAll('a,button,input,select,textarea,[role="button"],[tabindex]')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // Un enlace dentro de un párrafo es texto, no un objetivo táctil discreto.
    if (el.tagName === 'A' && el.closest('p,li,figcaption,dd')) continue;
    if (r.width < ${MIN_TARGET} || r.height < ${MIN_TARGET}) {
      small.push({
        selector: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
        text: (el.textContent || '').trim().slice(0, 40),
        width: Math.round(r.width), height: Math.round(r.height)
      });
    }
  }
  return small;
})()`;

const IMAGES_FN = `
(() => {
  const imgs = [...document.images].map(i => ({
    src: i.currentSrc || i.getAttribute('src') || '',
    declaresSize: !!(i.getAttribute('width') && i.getAttribute('height')),
    natural: i.naturalWidth + 'x' + i.naturalHeight,
    rendered: Math.round(i.clientWidth) + 'x' + Math.round(i.clientHeight),
    loading: i.loading,
    alt: i.getAttribute('alt'),
    hidden: i.clientWidth === 0 || i.clientHeight === 0
  }));
  const res = performance.getEntriesByType('resource').filter(e => e.initiatorType === 'img' || /\\.(webp|avif|png|jpe?g|svg|gif)(\\?|$)/i.test(e.name));
  return {
    images: imgs,
    withoutSize: imgs.filter(i => !i.declaresSize).length,
    missingAlt: imgs.filter(i => i.alt === null).length,
    downloadedButHidden: imgs.filter(i => i.hidden && i.natural !== '0x0').map(i => i.src.split('/').pop()),
    requestCount: res.length,
    transferBytes: res.reduce((a, b) => a + (b.transferSize || 0), 0),
    decodedBytes: res.reduce((a, b) => a + (b.decodedBodySize || 0), 0)
  };
})()`;

const FOCUS_FN = `
(async () => {
  // Recorre los primeros focos con Tab y comprueba que el indicador es visible.
  const seen = [];
  const el = document.querySelector('a,button');
  if (el) el.focus();
  for (let i = 0; i < 14; i++) {
    const a = document.activeElement;
    if (!a || a === document.body) break;
    const cs = getComputedStyle(a);
    const visible = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    seen.push({
      selector: a.tagName.toLowerCase() + (a.className ? '.' + String(a.className).split(' ')[0] : ''),
      outline: cs.outlineStyle + ' ' + cs.outlineWidth,
      visible
    });
    const focusables = [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter(n => n.offsetParent !== null);
    const idx = focusables.indexOf(a);
    if (idx < 0 || idx + 1 >= focusables.length) break;
    focusables[idx + 1].focus();
  }
  return seen;
})()`;

const CLS_FN = `
(() => new Promise(resolve => {
  let cls = 0;
  const po = new PerformanceObserver(list => {
    for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
  });
  try { po.observe({ type: 'layout-shift', buffered: true }); } catch { return resolve(null); }
  setTimeout(() => { po.disconnect(); resolve(Number(cls.toFixed(4))); }, 1200);
}))()`;

async function main() {
  const { chromium } = resolvePlaywright();
  const launchOptions = {};
  if (process.env.BROWSER_PATH) launchOptions.executablePath = process.env.BROWSER_PATH;
  const browser = await chromium.launch(launchOptions);
  const report = { generatedAt: new Date().toISOString(), base: BASE, breakpoints: {} };

  for (const bp of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      isMobile: !!bp.mobile, hasTouch: !!bp.mobile, locale: 'es-CL'
    });
    const page = await context.newPage();
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => {
      const h = document.getElementById('heroTitle');
      return h && h.textContent.trim().length > 0;
    }, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);

    const cls = await page.evaluate(CLS_FN);

    // Recorrer la página para que carguen las imágenes diferidas antes de medir.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
      }
      window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    });

    const [contrast, targets, images, focus, overflow] = await Promise.all([
      page.evaluate(CONTRAST_FN),
      page.evaluate(TARGETS_FN),
      page.evaluate(IMAGES_FN),
      page.evaluate(FOCUS_FN),
      page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        overflows: document.documentElement.scrollWidth > window.innerWidth + 1
      }))
    ]);

    report.breakpoints[bp.name] = {
      cls,
      overflow,
      contrastFailures: contrast.filter(c => !c.manual),
      contrastManualReview: contrast.filter(c => c.manual).length,
      smallTargets: targets,
      focus: { checked: focus.length, withoutVisibleIndicator: focus.filter(f => !f.visible) },
      images: {
        count: images.images.length,
        withoutDeclaredSize: images.withoutSize,
        missingAltAttribute: images.missingAlt,
        downloadedButHidden: images.downloadedButHidden,
        requestCount: images.requestCount,
        transferKB: Math.round(images.transferBytes / 1024),
        decodedKB: Math.round(images.decodedBytes / 1024)
      }
    };
    console.log(`${bp.name.padEnd(10)} CLS ${String(cls).padEnd(7)} contraste:${contrast.filter(c => !c.manual).length} objetivos<44:${targets.length} imgs:${images.images.length} ${Math.round(images.transferBytes / 1024)}kB ${overflow.overflows ? 'DESBORDA' : ''}`);
    await context.close();
  }

  /* Movimiento reducido: se comprueba que las transiciones quedan anuladas. */
  const rmContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await rmPage.waitForTimeout(1500);
  report.reducedMotion = await rmPage.evaluate(() => {
    const animated = [...document.querySelectorAll('.territoryGrid img,.baseCard,.capCard,.resCard')];
    const moving = animated.filter(el => {
      const cs = getComputedStyle(el);
      return cs.transitionDuration !== '0s' && cs.transitionProperty !== 'none';
    });
    return {
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      elementsChecked: animated.length,
      stillTransitioning: moving.map(el => el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0])
    };
  });
  await rmContext.close();
  await browser.close();

  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');

  const totals = Object.values(report.breakpoints);
  const contrastTotal = totals.reduce((a, b) => a + b.contrastFailures.length, 0);
  const targetTotal = totals.reduce((a, b) => a + b.smallTargets.length, 0);
  const focusTotal = totals.reduce((a, b) => a + b.focus.withoutVisibleIndicator.length, 0);
  const overflowTotal = totals.filter(b => b.overflow.overflows).length;

  console.log(`\nResumen`);
  console.log(`  fallos de contraste       : ${contrastTotal}`);
  console.log(`  objetivos < 44×44         : ${targetTotal}`);
  console.log(`  focos sin indicador       : ${focusTotal}`);
  console.log(`  breakpoints que desbordan : ${overflowTotal}`);
  console.log(`  movimiento reducido       : ${report.reducedMotion.stillTransitioning.length} elemento(s) siguen con transición`);
  console.log(`  informe                   : ${OUT}`);

  if (contrastTotal || overflowTotal) process.exitCode = 1;
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
