// Original vanilla-JS interpretations of React Bits' motion ideas.
// References and implementation choices are recorded in docs/design.md.
export function createPortfolioMotion({ paused = false } = {}) {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const activeAnimations = new Set();
  const hero = document.querySelector('.hero');
  const statement = document.querySelector('.intro-statement');
  const spotlights = [...document.querySelectorAll('.project-cover, .project-image, .edit-art')];
  const magneticTargets = [...document.querySelectorAll('.round-link, .text-link')].map(control => ({
    control, arrow: control.querySelector('span:last-child')
  })).filter(target => target.arrow);
  let isPaused = paused;
  let frame = 0;
  let visibleStatement = true;

  function animate(element, keyframes, options) {
    if (isPaused || !element.animate) return;
    const animation = element.animate(keyframes, options);
    activeAnimations.add(animation);
    animation.onfinish = () => activeAnimations.delete(animation);
    animation.oncancel = () => activeAnimations.delete(animation);
  }

  // Preserve the heading's accessible name while its visual letters move separately.
  let letterIndex = 0;
  hero.classList.add('split-ready');
  document.querySelectorAll('.hero-name, .hero h1 > em').forEach(word => {
    const letters = [...word.textContent].map(character => {
      const letter = document.createElement('span');
      letter.className = 'name-letter';
      letter.textContent = character;
      letter.setAttribute('aria-hidden', 'true');
      return letter;
    });
    word.replaceChildren(...letters);
    letters.forEach(letter => {
      animate(letter, [
        { opacity: 0, transform: 'translateY(75%) rotate(6deg)', filter: 'blur(8px)' },
        { opacity: 1, transform: 'translateY(0) rotate(0)', filter: 'blur(0)' }
      ], { duration: 1000, delay: 100 + letterIndex++ * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
  });

  // Keep the italic words and highlight intact when splitting the biography.
  statement.setAttribute('aria-label', statement.textContent);
  const walker = document.createTreeWalker(statement, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  const words = [];
  textNodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part.trim()) fragment.append(document.createTextNode(part));
      else {
        const word = document.createElement('span');
        word.className = 'scroll-word';
        word.textContent = part;
        word.setAttribute('aria-hidden', 'true');
        words.push(word);
        fragment.append(word);
      }
    });
    node.replaceWith(fragment);
  });

  function renderScroll() {
    frame = 0;
    if (isPaused || document.hidden || !visibleStatement) return;
    const bounds = statement.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight * .9 - bounds.top) / (innerHeight * .46)));
    words.forEach((word, index) => {
      const amount = Math.min(1, Math.max(0, (progress * (words.length + 3) - index) / 3));
      word.style.opacity = String(.28 + amount * .72);
      word.style.filter = `blur(${(1 - amount) * 1.5}px)`;
      word.style.transform = `translateY(${(1 - amount) * 5}px)`;
    });
  }

  function scheduleScroll() {
    if (!frame && !isPaused && !document.hidden && visibleStatement) frame = requestAnimationFrame(renderScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    const scrollObserver = new IntersectionObserver(entries => {
      visibleStatement = entries[0].isIntersecting;
      if (visibleStatement) scheduleScroll();
    }, { rootMargin: '15% 0px' });
    scrollObserver.observe(statement);

    // Give section titles a short, staggered entrance as they arrive in view.
    const headingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        [...entry.target.children].filter(element => element.tagName !== 'BR').forEach((element, index) => {
          animate(element, [
            { opacity: 0, transform: 'translateY(24px)', filter: 'blur(5px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
          ], { duration: 800, delay: index * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        });
        headingObserver.unobserve(entry.target);
      });
    }, { threshold: .35 });
    document.querySelectorAll('.section-heading h2, .sports-heading h2, .editing-copy h2, .off-duty h2').forEach(heading => headingObserver.observe(heading));

    const heroObserver = new IntersectionObserver(entries => {
      hero.classList.toggle('motion-out-of-view', !entries[0].isIntersecting);
    });
    heroObserver.observe(hero);
  }

  spotlights.forEach(card => {
    card.classList.add('spotlight-surface');
    card.addEventListener('pointermove', event => {
      if (isPaused || !finePointer.matches || event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
      card.classList.add('spotlight-active');
    }, { passive: true });
    card.addEventListener('pointerleave', () => card.classList.remove('spotlight-active'));
  });

  magneticTargets.forEach(({ control, arrow }) => {
    arrow.classList.add('magnetic-arrow');
    control.addEventListener('pointermove', event => {
      if (isPaused || !finePointer.matches || event.pointerType === 'touch') return;
      const bounds = control.getBoundingClientRect();
      const x = Math.max(-9, Math.min(9, (event.clientX - bounds.left - bounds.width / 2) * .07));
      const y = Math.max(-7, Math.min(7, (event.clientY - bounds.top - bounds.height / 2) * .2));
      arrow.style.translate = `${x}px ${y}px`;
    }, { passive: true });
    control.addEventListener('pointerleave', () => { arrow.style.translate = '0px 0px'; });
    control.addEventListener('blur', () => { arrow.style.translate = '0px 0px'; });
  });

  function resetPointers() {
    spotlights.forEach(card => card.classList.remove('spotlight-active'));
    magneticTargets.forEach(({ arrow }) => { arrow.style.translate = '0px 0px'; });
  }

  function setPaused(value) {
    isPaused = value;
    if (isPaused) {
      cancelAnimationFrame(frame);
      frame = 0;
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
      words.forEach(word => {
        word.style.opacity = '1';
        word.style.filter = 'none';
        word.style.transform = 'none';
      });
      resetPointers();
    } else scheduleScroll();
  }

  finePointer.addEventListener('change', resetPointers);
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) {
      activeAnimations.forEach(animation => animation.pause());
      resetPointers();
    } else if (!isPaused) {
      activeAnimations.forEach(animation => animation.play());
      scheduleScroll();
    }
  });
  setPaused(paused);
  return { setPaused };
}
