import { Component, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Aurora from '../vendor/react-bits/Aurora';
import BlurText from '../vendor/react-bits/BlurText';
import GlitchText from '../vendor/react-bits/GlitchText';
import DecryptedText from '../vendor/react-bits/DecryptedText';
import RotatingText from '../vendor/react-bits/RotatingText';
import ScrollVelocity from '../vendor/react-bits/ScrollVelocity';
import SpotlightCard from '../vendor/react-bits/SpotlightCard';
import TiltedCard from '../vendor/react-bits/TiltedCard';
import Magnet from '../vendor/react-bits/Magnet';
import ClickSpark from '../vendor/react-bits/ClickSpark';
import Ribbons from '../vendor/react-bits/Ribbons';
import './portfolio.css';
import './chapters.css';
import './zine.css';
import './stickers.css';

// Continuous effects sleep outside the viewport and in background tabs.
function ActiveEffect({ host, children, fallback = null }) {
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' });
    observer.observe(host);
    const visibility = () => setForeground(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, [host]);
  return foreground && visible ? children : fallback;
}

class EffectBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const Markup = ({ html, className = '' }) => <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
const roles = ['BUILDER.', 'ATHLETE.', 'CREATOR.', 'VIDEO EDITOR.'];
const auroraColors = ['#631BFF', '#D58BFF', '#8B33FF'];
const cursorColors = ['#B36BFF', '#D8ADFF', '#D5FF43'];
const cursorWidths = [10, 4, 1.5];
const transparentBackground = [0, 0, 0, 0];
const tickerLine = <>BUILD. PLAY. REPEAT. <span className="ticker-mark" /> ALWAYS CURIOUS. <span className="ticker-mark" /></>;

export function createPortfolioMotion({ paused = false } = {}) {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const islands = [];
  let currentPaused = null;

  function register(selector, render, className = '', { label = false } = {}) {
    document.querySelectorAll(selector).forEach(host => {
      islands.push({ host, html: host.innerHTML, text: host.textContent.trim(), render, className, label,
        originalLabel: host.getAttribute('aria-label'), root: null });
    });
  }

  register('.hero-aurora', ({ host }) => <ActiveEffect host={host}>
    <Aurora colorStops={auroraColors} amplitude={1.25} blend={.55} speed={1.05} />
  </ActiveEffect>, 'rb-aurora');

  register('.hero-name, .hero h1 > em, .footer-name > span, .footer-name > em',
    ({ text }) => <span aria-hidden="true"><GlitchText as="span" enableOnHover speed={.35} className="zine-glitch">{text}</GlitchText></span>, 'rb-heading', { label: true });

  register('.page-title > span, .page-title > em, .resume-group-heading h2, .story-section h2',
    ({ text, host }) => <span aria-hidden="true"><BlurText as="span" text={text} animateBy={host.closest('.hero') ? 'letters' : 'words'}
      delay={25} direction="bottom" stepDuration={.06} className="rb-blur"
      animationFrom={{ filter: 'none', opacity: 1, x: -7, y: 3 }}
      animationTo={[{ x: 7, y: -2 }, { x: -3, y: 1 }, { x: 0, y: 0 }]} />
    </span>, 'rb-heading', { label: true });

  register('.hero-top .eyebrow:first-child, .page-hero > .eyebrow, .section-kicker > .eyebrow:first-child, .hero-index > span:first-child',
    ({ text }) => <span aria-hidden="true"><DecryptedText text={text} animateOn="inViewHover" speed={38}
      maxIterations={8} characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/" encryptedClassName="rb-encrypted"
      parentClassName="rb-decrypt" /></span>, 'rb-label', { label: true });

  register('.rotating-role', ({ host, text }) => <ActiveEffect host={host} fallback={text}>
    <RotatingText texts={roles} rotationInterval={3200} staggerDuration={.018} staggerFrom="last"
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-120%' }} animatePresenceMode="popLayout"
      mainClassName="rb-role" splitLevelClassName="rb-role-word" transition={{ type: 'spring', damping: 28, stiffness: 350 }} />
  </ActiveEffect>);

  register('.ticker', ({ host }) => <ActiveEffect host={host} fallback={<div className="rb-ticker-static">{tickerLine}</div>}>
    <ScrollVelocity texts={[tickerLine]} velocity={55} stutter={true} numCopies={4}
      velocityMapping={{ input: [0, 1000], output: [0, 3] }} className="rb-ticker-copy"
      parallaxClassName="rb-parallax" scrollerClassName="rb-scroller" />
  </ActiveEffect>, 'rb-ticker');

  register('.chapter-card', ({ html }) => {
    const fragment = document.createElement('div');
    fragment.innerHTML = html;
    const art = fragment.querySelector('.chapter-art');
    const image = art.querySelector('img');
    const imageSrc = image?.getAttribute('src');
    image?.remove();
    const caption = fragment.querySelector('.chapter-art-caption')?.outerHTML || '';
    return <SpotlightCard className="rb-chapter-spotlight" spotlightColor="rgba(153, 74, 255, 0.19)">
      <div className="chapter-row">
        <Markup className="chapter-label-slot" html={fragment.querySelector('.chapter-label').outerHTML} />
        <Markup className="chapter-copy-slot" html={fragment.querySelector('.chapter-card-copy').outerHTML} />
        <div className="chapter-visual" aria-hidden="true">
          <div className={art.className}>
            <TiltedCard imageSrc={imageSrc} altText="" containerHeight="100%" imageHeight="100%" imageWidth="100%"
              rotateAmplitude={finePointer.matches ? 6 : 0} scaleOnHover={finePointer.matches ? 1.035 : 1}
              showMobileWarning={false} showTooltip={false} displayOverlayContent
              overlayContent={imageSrc ? null : <Markup html={art.innerHTML} className="chapter-art-content" />} />
          </div>
          {caption && <Markup html={caption} />}
        </div>
        <span className="chapter-go" aria-hidden="true">↗</span>
      </div>
    </SpotlightCard>;
  }, 'rb-card');

  register('.resume-entry-content', ({ html }) => <SpotlightCard className="rb-resume-spotlight" spotlightColor="rgba(179, 107, 255, 0.22)">
    <Markup html={html} />
  </SpotlightCard>, 'rb-resume');

  register('.round-link', ({ html }) => <Magnet padding={45} magnetStrength={5} disabled={!finePointer.matches}
    wrapperClassName="rb-magnet" innerClassName="rb-magnet-inner"><Markup html={html} className="rb-magnet-content" /></Magnet>);

  const sparkHost = document.createElement('div');
  sparkHost.className = 'rb-click-sparks';
  sparkHost.setAttribute('aria-hidden', 'true');
  document.body.append(sparkHost);
  register('.rb-click-sparks', ({ host }) => <ActiveEffect host={host}>
    <ClickSpark global sparkColor="#CF9BFF" sparkSize={12} sparkRadius={32} sparkCount={9} duration={550} />
  </ActiveEffect>);

  const cursorHost = document.createElement('div');
  cursorHost.className = 'rb-cursor-trail';
  cursorHost.setAttribute('aria-hidden', 'true');
  document.body.append(cursorHost);
  register('.rb-cursor-trail', ({ host }) => finePointer.matches ? <ActiveEffect host={host}>
    <Ribbons global colors={cursorColors} thicknesses={cursorWidths} backgroundColor={transparentBackground}
      baseSpring={.18} baseFriction={.62} offsetFactor={.0045} pointCount={40}
      maxAge={320} speedMultiplier={.5} enableFade idleTimeout={750} />
  </ActiveEffect> : null);

  function setPaused(value) {
    if (value === currentPaused) return;
    currentPaused = value;
    islands.forEach(island => {
      const { host, html, className, label, originalLabel } = island;
      island.root?.unmount();
      island.root = null;
      host.innerHTML = html;
      if (className) host.classList.toggle(className, !value);
      if (originalLabel === null) host.removeAttribute('aria-label');
      else host.setAttribute('aria-label', originalLabel);
      if (!value) {
        if (label) host.setAttribute('aria-label', island.text);
        island.root = createRoot(host);
        island.root.render(<EffectBoundary fallback={<Markup html={html} />}>
          {island.render(island)}
        </EffectBoundary>);
      }
    });
  }

  finePointer.addEventListener('change', () => {
    if (currentPaused) return;
    setPaused(true);
    setPaused(false);
  });
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
  setPaused(paused);
  return { setPaused };
}
