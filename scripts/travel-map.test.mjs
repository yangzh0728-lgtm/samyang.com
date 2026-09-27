import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTravelMap } from './travel-map.mjs';

test('an empty travel log does not invent any visits', () => {
  const html = renderTravelMap([]);
  assert.doesNotMatch(html, /data-visited="true"/);
  assert.match(html, /Travel log coming soon/);
  assert.match(html, /data-country="124"/);
});

test('confirmed countries light up and appear in the text list', () => {
  const html = renderTravelMap(['124', '392']);
  assert.match(html, /data-country="124"[^>]*data-visited="true"/);
  assert.match(html, /data-country="392"[^>]*data-visited="true"/);
  assert.match(html, /data-country="840"[^>]*data-visited="false"/);
  assert.match(html, /<li>Canada<\/li>/);
  assert.match(html, /<li>Japan<\/li>/);
  assert.match(html, /data-travel-count>02</);
  assert.doesNotMatch(html, /Travel log coming soon/);
});

test('invalid or repeated country IDs cannot silently corrupt the travel log', () => {
  assert.throws(() => renderTravelMap(['124', '124']), /Duplicate/);
  assert.throws(() => renderTravelMap(['not-a-country']), /Unknown/);
});

test('outlying islands sharing a country code are grouped with that country', () => {
  const html = renderTravelMap(['036']);
  assert.equal([...html.matchAll(/data-country="036"/g)].length, 1);
  assert.match(html, /<li>Australia<\/li>/);
  assert.match(html, /data-travel-count>01</);
  const countryIds = [...html.matchAll(/data-country="([^"]+)"/g)].map(match => match[1]);
  assert.equal(countryIds.length, new Set(countryIds).size);
});
