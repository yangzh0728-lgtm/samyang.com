import '../motion/hero-quotes.css';

export function createHeroQuotes() {
  const quotes = document.querySelector('.hero-quotes');
  if (!quotes) return;
  if (!('IntersectionObserver' in window)) {
    quotes.classList.add('is-visible');
    return;
  }
  // CSS handles motion preferences; the observer sleeps the layer offscreen.
  const observer = new IntersectionObserver(([entry]) => {
    quotes.classList.toggle('is-visible', entry.isIntersecting);
  });
  observer.observe(quotes);
}
