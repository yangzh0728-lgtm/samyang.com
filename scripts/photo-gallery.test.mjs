import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFloorballGallery } from './photo-gallery.mjs';

const photo = { id: 'match-1', src: '/assets/floorball/match-1.jpg', alt: 'Sam playing floorball', caption: 'A day on the court', width: 1600, height: 1200 };

test('an empty gallery does not invent photos or leave broken image controls', () => {
  const html = renderFloorballGallery([]);
  assert.match(html, /COMING SOON/);
  assert.match(html, /00 \/ PHOTOS/);
  assert.doesNotMatch(html, /<img|data-photo-gallery|<button/);
});

test('supplied photos retain captions and dimensions in the no-JavaScript gallery', () => {
  const html = renderFloorballGallery([photo, { ...photo, id: 'match-2', caption: 'Team <first> & "always"', width: 1200, height: 1600 }]);
  assert.equal((html.match(/<figure data-photo=/g) || []).length, 2);
  assert.match(html, /Team &lt;first&gt; &amp; &quot;always&quot;/);
  assert.match(html, /width="1200" height="1600"/);
  assert.match(html, /tabindex="0"/);
  assert.doesNotMatch(html, /COMING SOON/);
});

test('invalid photo data fails before shipping inaccessible or unsafe gallery markup', () => {
  assert.throws(() => renderFloorballGallery([photo, photo]), /unique/);
  assert.throws(() => renderFloorballGallery([{ ...photo, src: '/assets/../private/photo.jpg' }]), /local image/);
  assert.throws(() => renderFloorballGallery([{ ...photo, src: 'https://example.com/photo.jpg' }]), /local image/);
  assert.throws(() => renderFloorballGallery([{ ...photo, alt: '' }]), /alt text/);
  assert.throws(() => renderFloorballGallery([{ ...photo, height: 0 }]), /dimensions/);
});
