import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import Carousel from '../vendor/react-bits/Carousel';
import './gallery.css';

class GalleryBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div dangerouslySetInnerHTML={{ __html: this.props.fallback }} /> : this.props.children; }
}

export function createPhotoGalleries({ paused = false } = {}) {
  const galleries = [...document.querySelectorAll('[data-photo-gallery]')].map(host => {
    const fallback = host.innerHTML;
    const items = [...host.querySelectorAll('[data-photo]')].map(figure => {
      const img = figure.querySelector('img');
      return { id: figure.dataset.photo, src: img.getAttribute('src'), alt: img.alt,
        width: Number(img.getAttribute('width')), height: Number(img.getAttribute('height')),
        caption: figure.querySelector('figcaption').textContent };
    });
    return { root: createRoot(host), fallback, items };
  });
  let current = null;
  function setPaused(value) {
    if (current === value) return;
    current = value;
    for (const { root, fallback, items } of galleries) {
      root.render(<GalleryBoundary fallback={fallback}><Carousel items={items} reducedMotion={value} /></GalleryBoundary>);
    }
  }
  setPaused(paused);
  return { setPaused };
}
