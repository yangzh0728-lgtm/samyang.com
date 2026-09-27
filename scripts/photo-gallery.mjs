import { floorballPhotos } from '../src/galleries/floorball.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderFloorballGallery(photos = floorballPhotos) {
  const ids = new Set();
  for (const photo of photos) {
    if (!photo.id || ids.has(photo.id)) throw new Error('Gallery photo IDs must be present and unique');
    ids.add(photo.id);
    if (!/^\/assets\/[a-zA-Z0-9_./-]+\.(jpe?g|png|webp|avif)$/i.test(photo.src) || photo.src.includes('..')) {
      throw new Error('Gallery photos must use local image assets');
    }
    if (!photo.alt?.trim() || !photo.caption?.trim()) throw new Error('Gallery photos need alt text and a caption');
    if (![photo.width, photo.height].every(size => Number.isInteger(size) && size > 0)) throw new Error('Gallery photos need valid dimensions');
  }

  return `<section class="floorball-gallery" id="floorball-gallery" aria-labelledby="floorball-gallery-title">
    <div class="gallery-heading"><div><p class="eyebrow">FLOORBALL / PHOTO JOURNAL</p><h2 id="floorball-gallery-title">In the <em>game.</em></h2></div><p>The games. The team.<br> The moments in between.</p></div>
    ${photos.length ? `<div class="photo-gallery-host" data-photo-gallery>
      <div class="photo-gallery-fallback" tabindex="0" role="group" aria-label="Floorball photos — scroll to browse">
        ${photos.map(photo => `<figure data-photo="${escape(photo.id)}"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"><figcaption>${escape(photo.caption)}</figcaption></figure>`).join('')}
      </div>
    </div>` : `<div class="gallery-empty">
      <div class="gallery-empty-top"><span>THE FLOORBALL ARCHIVE</span><span>00 / PHOTOS</span></div>
      <span class="gallery-empty-word" aria-hidden="true">FLOORBALL</span>
      <div class="gallery-empty-stamp"><span>FIRST FRAME</span><strong>COMING SOON.</strong></div>
      <p>Photos from the court are on the way.</p>
    </div>`}
  </section>`;
}
