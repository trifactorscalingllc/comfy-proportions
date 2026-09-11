#!/usr/bin/env node
// Comfy Proportions audit.
// Loads a page at several viewport widths and reports the numbers that
// decide whether a layout keeps its proportions: root size, h1 ratio,
// hero height, wrapping calls to action, horizontal overflow, grid
// column counts and whether the hamburger is showing.
//
// Usage:
//   node scripts/audit.mjs <url> [--widths 360,480,768,991,992,1024,1280,1440,1920]
//                                [--out dir] [--height N] [--no-shots]
//
// Exit codes: 0 clean, 1 a CTA wraps (outside the footer) or a width overflows, 2 setup problem.
//
// Playwright resolution order:
//   1. `playwright` resolved from this file (a local `npm i playwright`)
//   2. the path in COMFY_PLAYWRIGHT
//   3. /Users/tfs/tom/node_modules/playwright (the shared install on the TFS mini)
// Install locally with: npm i playwright && npx playwright install chromium

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);

const DEFAULT_WIDTHS = [360, 480, 768, 991, 992, 1024, 1280, 1440, 1920];
const ROOT_SELECTORS = ['[data-comfy-root]', '.comfy', '.v2', 'body'];
const HAMBURGER = 'button[aria-label*="menu" i], .menu-btn, .v2-menu-button';

function usage(msg) {
  if (msg) console.error(`error: ${msg}\n`);
  console.error('usage: node scripts/audit.mjs <url> [--widths 360,480,...] [--out dir] [--height N] [--no-shots]');
  process.exit(msg ? 2 : 0);
}

function parseArgs(argv) {
  const opts = { url: null, widths: DEFAULT_WIDTHS, out: null, height: null, shots: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--widths') {
      const v = argv[++i];
      if (!v) usage('--widths needs a comma list');
      opts.widths = v.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
      if (!opts.widths.length) usage('--widths had no usable numbers');
    } else if (a === '--out') {
      opts.out = argv[++i] || usage('--out needs a directory');
    } else if (a === '--height') {
      opts.height = parseInt(argv[++i], 10) || usage('--height needs a number');
    } else if (a === '--no-shots') {
      opts.shots = false;
    } else if (a === '-h' || a === '--help') {
      usage();
    } else if (!opts.url && !a.startsWith('-')) {
      opts.url = a;
    } else {
      usage(`unknown argument ${a}`);
    }
  }
  if (!opts.url) usage('a URL is required');
  if (!/^(https?|file):\/\//i.test(opts.url)) opts.url = `https://${opts.url}`;
  return opts;
}

function loadPlaywright() {
  const candidates = [
    'playwright',
    process.env.COMFY_PLAYWRIGHT,
    '/Users/tfs/tom/node_modules/playwright',
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return { pw: require(c), from: c };
    } catch {
      // try the next candidate
    }
  }
  console.error(
    'Playwright not found. Install it next to the skill:\n' +
      '  npm i playwright && npx playwright install chromium\n' +
      'or set COMFY_PLAYWRIGHT to an existing playwright package directory.',
  );
  process.exit(2);
}

// Runs inside the page. Keep it self-contained: no imports, no closures.
function probe({ rootSelectors, hamburgerSelector }) {
  const px = (v) => parseFloat(v) || 0;
  const cs = (el) => getComputedStyle(el);
  const visible = (el) => {
    if (!el) return false;
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const html = document.documentElement;
  const htmlPx = px(cs(html).fontSize);

  let rootEl = null;
  let rootSel = null;
  for (const sel of rootSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      rootEl = el;
      rootSel = sel;
      break;
    }
  }
  const rootPx = rootEl ? px(cs(rootEl).fontSize) : htmlPx;

  const h1 = document.querySelector('h1');
  const h1Px = h1 ? px(cs(h1).fontSize) : null;

  // Hero: an explicit [data-hero], else the first section after the header,
  // else the first section on the page. Zero-height matches are skipped.
  const firstTall = (sel) => [...document.querySelectorAll(sel)].find((el) => el.getBoundingClientRect().height > 0) || null;
  let hero = document.querySelector('[data-hero]');
  let heroTag = hero ? '[data-hero]' : null;
  if (!hero) {
    hero = firstTall('header + section');
    if (hero) heroTag = 'header + section';
  }
  if (!hero) {
    hero = firstTall('section');
    if (hero) heroTag = 'section';
  }
  const heroShare = hero ? hero.getBoundingClientRect().height / window.innerHeight : null;

  // A call to action wraps when text that shares one block container
  // occupies two or more line boxes. Each hit is tagged with its region
  // (nav, hero, main, footer). Footer wraps are reported but do not fail
  // the run: footer links are secondary and may wrap first. Text under an absolutely positioned
  // child is skipped (hover duplicates). Inline links inside running text
  // (a link in the middle of a paragraph) are skipped: they wrap with the
  // paragraph and are not calls to action.
  const isAbsoluteUnder = (node, top) => {
    let el = node.parentElement;
    while (el && el !== top) {
      const p = cs(el).position;
      if (p === 'absolute' || p === 'fixed') return true;
      el = el.parentElement;
    }
    return false;
  };
  const blockContainer = (node, top) => {
    let el = node.parentElement;
    while (el && el !== top) {
      if (cs(el).display !== 'inline' && cs(el).display !== 'contents') return el;
      el = el.parentElement;
    }
    return top;
  };
  const inRunningText = (el) => {
    if (cs(el).display !== 'inline' || !el.parentElement) return false;
    let other = '';
    for (const n of el.parentElement.childNodes) {
      if (n === el) continue;
      if (n.nodeType === Node.TEXT_NODE) other += n.nodeValue;
      else if (n.nodeType === Node.ELEMENT_NODE && cs(n).display === 'inline') other += n.textContent;
    }
    return other.trim().length > 0;
  };
  const countLines = (rects) => {
    if (rects.length < 2) return rects.length;
    rects.sort((a, b) => a.top - b.top);
    const minH = Math.min(...rects.map((r) => r.height));
    let lines = 1;
    for (let i = 1; i < rects.length; i++) {
      if (rects[i].top - rects[i - 1].top > minH * 0.6) lines++;
    }
    return lines;
  };
  const regionOf = (el) => {
    if (el.closest('footer, [role="contentinfo"], [class*="footer" i]')) return 'footer';
    if (el.closest('nav, header, [role="banner"]')) return 'nav';
    const heroEl = hero && hero.contains(el);
    return heroEl ? 'hero' : 'main';
  };
  const wraps = [];
  for (const el of document.querySelectorAll('a, button')) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length > 60) continue;
    if (!visible(el)) continue;
    if (inRunningText(el)) continue;
    const groups = new Map();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      if (isAbsoluteUnder(n, el)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const box = blockContainer(n, el);
      if (!groups.has(box)) groups.set(box, []);
      for (const r of range.getClientRects()) {
        if (r.width > 0 && r.height > 0) groups.get(box).push({ top: r.top, height: r.height });
      }
    }
    let wrapped = false;
    for (const rects of groups.values()) {
      if (countLines(rects) >= 2) {
        wrapped = true;
        break;
      }
    }
    if (wrapped) wraps.push({ region: regionOf(el), text: text.slice(0, 40) });
  }

  const overflow = Math.max(html.scrollWidth, document.body ? document.body.scrollWidth : 0) - html.clientWidth;

  const grids = {};
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length < 2) continue;
    const s = cs(el);
    if (s.display !== 'grid' && s.display !== 'inline-grid') continue;
    if (!visible(el)) continue;
    const cols = s.gridTemplateColumns.trim();
    const count = cols === 'none' ? 1 : cols.split(/\s+/).filter((t) => !t.startsWith('[')).length;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean) : [];
    const key = cls.length ? '.' + cls.slice(0, 2).join('.') : el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');
    if (!grids[key]) grids[key] = new Set();
    grids[key].add(count);
  }
  const gridOut = {};
  for (const k of Object.keys(grids)) gridOut[k] = [...grids[k]].sort((a, b) => b - a).join('|');

  let hamburger = false;
  for (const el of document.querySelectorAll(hamburgerSelector)) {
    if (visible(el)) {
      hamburger = true;
      break;
    }
  }

  return { htmlPx, rootPx, rootSel, h1Px, heroShare, heroTag, wraps, overflow, grids: gridOut, hamburger };
}

const fmtPx = (n) => (n == null ? 'n/a' : `${Math.round(n * 10) / 10}px`);
const fmtRatio = (a, b) => (a == null || !b ? 'n/a' : `${Math.round((a / b) * 100) / 100}x`);
const fmtShare = (s) => (s == null ? 'n/a' : `${Math.round(s * 100)}%`);

function buildReport(url, rows, outDir) {
  const lines = [];
  lines.push(`# Comfy audit: ${url}`);
  lines.push('');
  lines.push(`Run: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('| width | html | root | h1 | h1/root | hero | CTA wraps | overflow | hamburger |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const root = `${fmtPx(r.rootPx)}${r.rootSel ? ` (${r.rootSel})` : ''}`;
    const hero = r.heroShare == null ? 'n/a' : `${fmtShare(r.heroShare)} (${r.heroTag})`;
    const wraps = r.wraps.length
      ? `${r.wraps.length}: ${r.wraps.slice(0, 3).map((w) => `${w.region}: "${w.text}"`).join(', ')}${r.wraps.length > 3 ? ', ...' : ''}`
      : '0';
    const overflow = r.overflow > 0 ? `${r.overflow}px` : 'none';
    lines.push(
      `| ${r.width} | ${fmtPx(r.htmlPx)} | ${root} | ${fmtPx(r.h1Px)} | ${fmtRatio(r.h1Px, r.rootPx)} | ${hero} | ${wraps} | ${overflow} | ${r.hamburger ? 'yes' : 'no'} |`,
    );
  }
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r.grids)))];
  lines.push('');
  if (keys.length) {
    lines.push('Grid columns by width:');
    lines.push('');
    lines.push(`| grid | ${rows.map((r) => r.width).join(' | ')} |`);
    lines.push(`|---|${rows.map(() => '---').join('|')}|`);
    for (const k of keys) {
      lines.push(`| \`${k}\` | ${rows.map((r) => r.grids[k] ?? '.').join(' | ')} |`);
    }
  } else {
    lines.push('No grid containers with more than one child were found.');
  }
  if (outDir) {
    lines.push('');
    lines.push(`Screenshots: ${outDir}`);
  }
  return lines.join('\n') + '\n';
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { pw, from } = loadPlaywright();
  const host = new URL(opts.url).hostname.replace(/[^a-z0-9.-]/gi, '_') || 'local';
  const outDir = resolve(opts.out || join('comfy-audit', host));
  mkdirSync(outDir, { recursive: true });

  console.error(`playwright: ${from}`);
  console.error(`out: ${outDir}`);

  const browser = await pw.chromium.launch();
  const context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const rows = [];

  try {
    for (const width of opts.widths) {
      const height = opts.height || (width < 768 ? 800 : 900);
      await page.setViewportSize({ width, height });
      try {
        await page.goto(opts.url, { waitUntil: 'networkidle', timeout: 45000 });
      } catch (err) {
        if (!page.url() || page.url() === 'about:blank') throw err;
        console.error(`warn: ${width}px: networkidle timed out, measuring anyway`);
      }
      await page.waitForTimeout(600);
      const data = await page.evaluate(probe, { rootSelectors: ROOT_SELECTORS, hamburgerSelector: HAMBURGER });
      if (opts.shots) {
        await page.screenshot({ path: join(outDir, `${width}.png`), fullPage: true }).catch((e) => {
          console.error(`warn: ${width}px: screenshot failed: ${e.message}`);
        });
      }
      rows.push({ width, ...data });
      console.error(`${width}px: root ${fmtPx(data.rootPx)} h1 ${fmtPx(data.h1Px)} wraps ${data.wraps.length} overflow ${data.overflow > 0 ? data.overflow + 'px' : 'none'}`);
    }
  } finally {
    await browser.close();
  }

  const report = buildReport(opts.url, rows, opts.shots ? outDir : null);
  writeFileSync(join(outDir, 'report.md'), report);
  process.stdout.write(report);

  const failWraps = rows.filter((r) => r.wraps.some((w) => w.region !== 'footer'));
  const failOverflow = rows.filter((r) => r.overflow > 0);
  if (failWraps.length || failOverflow.length) {
    console.error('');
    if (failWraps.length) console.error(`FAIL: a call to action wraps (outside the footer) at ${failWraps.map((r) => r.width).join(', ')}px`);
    if (failOverflow.length) console.error(`FAIL: horizontal overflow at ${failOverflow.map((r) => r.width).join(', ')}px`);
    process.exit(1);
  }
  console.error('');
  const footerOnly = rows.filter((r) => r.wraps.length);
  console.error(
    footerOnly.length
      ? `OK: no wrapping calls to action outside the footer, no horizontal overflow (footer links wrap at ${footerOnly.map((r) => r.width).join(', ')}px)`
      : 'OK: no wrapping calls to action, no horizontal overflow',
  );
}

main().catch((err) => {
  console.error(`error: ${err.message}`);
  process.exit(2);
});
