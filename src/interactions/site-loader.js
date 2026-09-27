// Inlined in the head: independent of the main bundle and third-party media.
(() => {
  const root = document.documentElement;
  let seen = false, motionOff = false;
  try {
    seen = sessionStorage.getItem('sam-intro-seen') === '1';
    motionOff = sessionStorage.getItem('sam-motion') === 'off';
  } catch { /* Storage is optional. */ }
  if (seen || motionOff || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const started = performance.now();
  let finished = false, readyTimer, fadeTimer;
  root.classList.add('site-loading');
  const deadline = setTimeout(() => dismiss(true), 3000);

  function dismiss(immediate = false) {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    clearTimeout(readyTimer);
    try { sessionStorage.setItem('sam-intro-seen', '1'); } catch { /* Storage is optional. */ }
    window.removeEventListener('DOMContentLoaded', ready);
    window.removeEventListener('keydown', skip);
    window.removeEventListener('pointerdown', skip);
    root.classList.add('site-loader-leaving');
    const remove = () => {
      root.classList.remove('site-loading');
      root.classList.remove('site-loader-leaving');
    };
    if (immediate) remove();
    else fadeTimer = setTimeout(remove, 320);
  }
  function ready() {
    readyTimer = setTimeout(() => dismiss(), Math.max(0, 800 - (performance.now() - started)));
  }
  function skip() { dismiss(true); }
  function restore() {
    dismiss(true);
    clearTimeout(fadeTimer);
    root.classList.remove('site-loading');
    root.classList.remove('site-loader-leaving');
  }
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('pointerdown', skip, { once: true });
  window.addEventListener('pagehide', restore);
  window.addEventListener('pageshow', event => { if (event.persisted) restore(); });
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
