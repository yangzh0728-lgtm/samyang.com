import { createRequire } from 'node:module';
import { geoArea, geoEqualEarth, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { visitedCountryIds } from '../src/travel.mjs';

const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-50m.json');
const regions = feature(world, world.objects.countries).features.filter(country => country.id !== '010');
// Natural Earth may split outlying islands into separate records with the same ISO ID.
// Keep one selectable shape, name, and visit count for the whole country.
const countries = [...Map.groupBy(regions, country => country.id || country.properties.name.toLowerCase().replace(/[^a-z]+/g, '-'))]
  .map(([id, parts]) => ({
    ...parts.reduce((largest, part) => geoArea(part) > geoArea(largest) ? part : largest),
    id,
    geometry: { type: 'MultiPolygon', coordinates: parts.flatMap(part => part.geometry.type === 'Polygon' ? [part.geometry.coordinates] : part.geometry.coordinates) }
  }))
  .sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'en'));
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const projection = geoEqualEarth().fitExtent([[24, 24], [1176, 600]], { type: 'Sphere' });
const path = geoPath(projection).digits(1);

export function renderTravelMap(visitedIds = visitedCountryIds) {
  const visited = new Set(visitedIds);
  if (visited.size !== visitedIds.length) throw new Error('Duplicate country in travel log');
  for (const id of visited) {
    if (!countries.some(country => country.id === id)) throw new Error(`Unknown travel country: ${id}`);
  }
  const marked = countries.filter(country => visited.has(country.id));
  const shapes = countries.map(country => {
    const name = escape(country.properties.name);
    const [x, y] = path.centroid(country);
    // Tiny islands get a visible locator as well as their real geographic shape.
    const dot = path.area(country) < 5 ? `<circle class="map-island" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4"/>` : '';
    return `<g class="map-country" data-country="${escape(country.id)}" data-name="${name}" data-visited="${visited.has(country.id)}"><title>${name}${visited.has(country.id) ? ' — visited' : ''}</title><path d="${path(country)}"/>${dot}</g>`;
  }).join('');

  return `<section class="travel-atlas section-pad" aria-labelledby="atlas-title" data-travel-map>
    <div class="atlas-topline"><div><p class="eyebrow">MY TRAVEL LOG / WORLD VIEW</p><h2 id="atlas-title">Places leave a mark.</h2></div><div class="travel-count"><strong data-travel-count>${String(marked.length).padStart(2, '0')}</strong><span>PLACES<br>VISITED</span></div></div>
    <div class="atlas-frame">
      <div class="atlas-toolbar"><div class="atlas-legend"><span><i class="legend-visited"></i>Visited</span><span><i></i>Not marked</span></div><span class="atlas-stamp">STILL EXPLORING ↗</span></div>
      <div class="atlas-viewport">
        <svg class="world-map" viewBox="0 0 1200 624" role="img" aria-labelledby="world-map-title world-map-description">
          <title id="world-map-title">Sam’s travel map</title><desc id="world-map-description">${marked.length ? `${marked.length} places marked as visited. See the list below.` : 'No places have been added to the travel log yet.'} Use the place picker below to inspect the map.</desc>
          <path class="map-graticule" d="${path(geoGraticule10())}"/>${shapes}
        </svg>
        <span class="atlas-coordinate" aria-hidden="true">180° W &nbsp; / &nbsp; 0° &nbsp; / &nbsp; 180° E</span>
      </div>
      <div class="atlas-controls"><div class="country-picker"><label for="travel-country">FIND A PLACE</label><select id="travel-country" disabled><option value="">Explore the map</option>${countries.map(country => `<option value="${escape(country.id)}">${escape(country.properties.name)}</option>`).join('')}</select></div><div class="country-readout" aria-live="polite" aria-atomic="true"><strong data-country-name>The world is open.</strong><span data-country-status>Hover or tap a place to take a look.</span></div></div>
    </div>
    <div class="travel-log"><div><p class="eyebrow">BEEN THERE / THE LIST</p><h3>${marked.length ? 'A few places. A lot of memories.' : 'Travel log coming soon.'}</h3></div>${marked.length ? `<ul class="visited-countries">${marked.map(country => `<li>${escape(country.properties.name)}</li>`).join('')}</ul>` : '<p class="travel-empty">I’m putting my travels on the map.<br>The places I’ve visited will light up here.</p>'}</div>
    <p class="map-source">Map data: <a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Natural Earth<span class="sr-only"> (opens in a new tab)</span></a> · Countries &amp; territories.</p>
    <noscript><p class="travel-noscript">The map and visited-place list are visible above. Enable JavaScript to use the place picker.</p></noscript>
  </section>`;
}
