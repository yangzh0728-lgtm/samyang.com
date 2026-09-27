import { createPortfolioMotion } from './motion/portfolio.jsx';
import { createStickerWall } from './interactions/sticker-wall.js';
import { createTravelMap } from './interactions/travel-map.js';
import { createHeroQuotes } from './interactions/hero-quotes.js';

const legacyRoutes = {
  '#about': '/about/', '#work': '/work/', '#sports': '/sports/', '#editing': '/editing/',
  '#profile/story': '/about/', '#profile/garage': '/work/#legacy-garage',
  '#profile/engineering': '/work/#engineering', '#profile/caliguide': '/work/#caliguide',
  '#profile/sports': '/sports/', '#profile/editing': '/editing/'
};

function redirectLegacyLink() {
  const path = legacyRoutes[location.hash];
  if (path && (location.pathname === '/' || location.pathname === '/index.html')) {
    location.replace(path);
    return true;
  }
  return false;
}
window.addEventListener('hashchange', redirectLegacyLink);

if (!redirectLegacyLink()) {
  createStickerWall();
  createTravelMap();
  createHeroQuotes();
  const motionButton = document.querySelector('.motion-toggle');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let savedMotion;
  try { savedMotion = sessionStorage.getItem('sam-motion'); } catch { /* Storage is optional. */ }
  let motionPaused = savedMotion === 'off' || (savedMotion !== 'on' && reduceMotion.matches);
  const portfolioMotion = createPortfolioMotion({ paused: motionPaused });

  function updateMotion(paused) {
    motionPaused = paused;
    portfolioMotion.setPaused(paused);
    document.documentElement.classList.toggle('motion-static', paused);
    document.body.classList.toggle('motion-paused', paused);
    document.body.classList.toggle('motion-enabled', !paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
    motionButton.title = paused ? 'Enable animations' : 'Pause animations';
    motionButton.querySelector('.motion-label').textContent = paused ? 'Motion off' : 'Motion on';
    motionButton.querySelector('.motion-symbol').textContent = paused ? '▷' : 'Ⅱ';
    if (paused) document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
  }
  updateMotion(motionPaused);
  motionButton.addEventListener('click', () => {
    updateMotion(!motionPaused);
    try { sessionStorage.setItem('sam-motion', motionPaused ? 'off' : 'on'); } catch { /* Storage is optional. */ }
  });
  reduceMotion.addEventListener('change', event => {
    updateMotion(event.matches);
    try { sessionStorage.removeItem('sam-motion'); } catch { /* Storage is optional. */ }
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          if (!motionPaused) entry.target.classList.add('glitch-enter');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach(element => {
      if (!motionPaused && element.getBoundingClientRect().top > innerHeight) element.classList.add('reveal-pending');
      observer.observe(element);
    });
  }
}
