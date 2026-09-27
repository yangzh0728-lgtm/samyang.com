import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const path = new URL('../src/interactions/site-loader.js', import.meta.url);
const code = existsSync(path) ? readFileSync(path, 'utf8') : '';

function boot({ stored = {}, reduced = false, blockedStorage = false } = {}) {
  let now = 0, next = 0;
  const timers = new Map(), listeners = new Map(), classes = new Set();
  const window = {
    addEventListener(name, fn) { const list = listeners.get(name) || new Set(); list.add(fn); listeners.set(name, list); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); }
  };
  const document = { documentElement: { classList: { add: n => classes.add(n), remove: n => classes.delete(n) } }, readyState: 'loading' };
  const context = { window, document, matchMedia: () => ({ matches: reduced }), performance: { now: () => now },
    sessionStorage: { getItem(k) { if (blockedStorage) throw Error('blocked'); return stored[k]; }, setItem(k,v) { if (blockedStorage) throw Error('blocked'); stored[k] = v; } },
    setTimeout(fn, delay) { timers.set(++next, { fn, at: now + delay }); return next; }, clearTimeout(id) { timers.delete(id); } };
  runInNewContext(code, context);
  return { classes, stored, fire(name) { for (const fn of [...(listeners.get(name) || [])]) fn({ type: name, persisted: name === 'pageshow' }); },
    advance(ms) { const end = now + ms; while (true) { const due = [...timers].filter(([, t]) => t.at <= end).sort((a,b) => a[1].at - b[1].at)[0]; if (!due) break; now = due[1].at; timers.delete(due[0]); due[1].fn(); } now = end; } };
}
test('first visit reveals content after DOM readiness and the short intro', () => {
  const page = boot(); assert.ok(page.classes.has('site-loading'));
  page.fire('DOMContentLoaded'); page.advance(799); assert.ok(page.classes.has('site-loading'));
  page.advance(401); assert.ok(!page.classes.has('site-loading'));
  assert.equal(page.stored['sam-intro-seen'], '1');
  assert.ok(!boot({ stored: page.stored }).classes.has('site-loading'));
});
test('a stalled page always dismisses the cover by the deadline', () => {
  const page = boot(); assert.ok(page.classes.has('site-loading'));
  page.advance(3400); assert.ok(!page.classes.has('site-loading'));
});
test('motion off and system reduced motion skip the intro', () => {
  for (const options of [{ reduced: true }, { stored: { 'sam-motion': 'off' } }]) {
    assert.ok(!boot(options).classes.has('site-loading'));
  }
});
test('blocked storage does not prevent the page from being revealed', () => {
  const page = boot({ blockedStorage: true }); assert.ok(page.classes.has('site-loading'));
  page.fire('DOMContentLoaded'); page.advance(1200); assert.ok(!page.classes.has('site-loading'));
});
test('keyboard interaction and browser page restore dismiss immediately', () => {
  for (const event of ['keydown', 'pointerdown', 'pageshow', 'pagehide']) {
    const page = boot(); assert.ok(page.classes.has('site-loading'));
    page.fire(event); assert.ok(!page.classes.has('site-loading'));
  }
});
