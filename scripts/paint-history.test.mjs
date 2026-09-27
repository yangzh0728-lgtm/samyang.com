import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaintHistory } from '../src/interactions/paint-history.mjs';
const frame = n => ({ data: new Uint8ClampedArray(n) });
test('undo history discards oldest frames to stay within its byte budget', () => {
  const history = createPaintHistory({ maxBytes: 24, maxEntries: 20 });
  const a = frame(12), b = frame(12), c = frame(12);
  history.push(a); history.push(b); history.push(c);
  assert.equal(history.pop(), c); assert.equal(history.pop(), b); assert.equal(history.pop(), undefined);
});
test('count limit and clearing release old snapshots', () => {
  const history = createPaintHistory({ maxBytes: 100, maxEntries: 2 });
  const a = frame(4), b = frame(4), c = frame(4);
  history.push(a); history.push(b); history.push(c);
  assert.equal(history.pop(), c); assert.equal(history.pop(), b); assert.equal(history.pop(), undefined);
  history.push(a); history.clear(); assert.equal(history.pop(), undefined);
});
test('oversize frames invalidate stale history without being retained', () => {
  const history = createPaintHistory({ maxBytes: 10 });
  history.push(frame(8)); history.push(frame(11)); assert.equal(history.pop(), undefined);
});
