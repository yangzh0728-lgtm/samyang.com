// Adapted from React Bits DepthCarousel, revision 5d0c00e7594c898e989b250d022806961f4c8478.
// Copyright 2026 David Haz. MIT + Commons Clause; see LICENSE.md.
// Retains upstream depth/spread/tilt, brightness, and blur layout.
// Uses existing Motion dependency instead of GSAP; manual finite photo navigation.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import './DepthCarousel.css';
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function DepthCarousel({ items, reducedMotion = false }) {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(800);
  const stage = useRef(null);
  const cards = useRef([]);
  const position = useRef(0);
  const tween = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const count = items.length;
  const cardWidth = Math.min(620, width * .76);
  const cardHeight = Math.min(440, cardWidth * .76);
  const spread = Math.min(95, width * .12);

  const layout = useCallback(pos => {
    cards.current.forEach((card, i) => {
      if (!card) return;
      const d = i - pos;
      const back = Math.max(0, d);
      const opacity = Math.abs(d) > 4.5 ? 0 : d < 0 ? Math.max(0, 1 + d) : 1;
      card.style.transform = `translate(-50%, -50%) translateX(${spread * d}px) translateZ(${-220 * d}px) rotateY(${22 * clamp(d, 0, 1)}deg)`;
      card.style.opacity = opacity;
      card.style.filter = `brightness(${Math.max(.15, 1 - back * .2)}) blur(${Math.min(3, back * .75)}px)`;
      card.style.zIndex = Math.round(2000 - d * 20);
      card.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      card.style.pointerEvents = opacity > .05 ? 'auto' : 'none';
    });
  }, [spread]);

  const settle = useCallback((target, immediate = false) => {
    tween.current?.stop();
    if (reducedMotion || immediate) { position.current = target; layout(target); return; }
    tween.current = animate(position.current, target, {
      duration: .65, ease: [0.22, 1, 0.36, 1],
      onUpdate: value => { position.current = value; layout(value); }
    });
  }, [layout, reducedMotion]);

  const goTo = useCallback(index => {
    const next = clamp(index, 0, count - 1);
    setActive(next);
    settle(next, Math.abs(next - position.current) > 1.5);
  }, [count, settle]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { tween.current?.stop(); position.current = active; layout(active); }, [layout, reducedMotion]);
  useEffect(() => () => tween.current?.stop(), []);

  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || count < 2) return;
    tween.current?.stop();
    suppressClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: active, moved: false };
  }
  function pointerMove(event) {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    const dx = event.clientX - current.x;
    if (!current.moved && Math.abs(event.clientY - current.y) > Math.abs(dx) + 8) { drag.current = null; return; }
    if (Math.abs(dx) < 8 && !current.moved) return;
    current.moved = true;
    suppressClick.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!reducedMotion) {
      position.current = clamp(current.start - dx / Math.max(cardWidth * .55, 80), 0, count - 1);
      layout(position.current);
    }
  }
  function pointerEnd(event, cancelled = false) {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - current.x;
    const step = !cancelled && current.moved && Math.abs(dx) > 35 ? (dx < 0 ? 1 : -1) : 0;
    goTo(current.start + step);
  }
  function keyDown(event) {
    if (event.target.tagName === 'SELECT' || event.altKey || event.metaKey || event.ctrlKey) return;
    const targets = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: count - 1 };
    if (event.key in targets) { event.preventDefault(); goTo(targets[event.key]); }
  }
  if (!count) return null;
  return <div className="depth-carousel" role="group" aria-roledescription="carousel" aria-label="Floorball photos"
    tabIndex={0} onKeyDown={keyDown} data-active-photo={active + 1}>
    <div className="depth-carousel__stage" ref={stage} style={{ height: cardHeight + 90 }}
      onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd}
      onPointerCancel={event => pointerEnd(event, true)}>
      {items.map((item, i) => <figure key={item.id} ref={el => { cards.current[i] = el; }}
        className="depth-carousel__card" style={{ width: cardWidth, height: cardHeight }} aria-hidden={i !== active}
        onClick={() => { if (!suppressClick.current) goTo(i); }}>
        {Math.abs(i - active) <= 5 && <img src={item.src} alt={item.alt} width={item.width} height={item.height} draggable={false}
          decoding="async" onError={event => { event.currentTarget.style.visibility = 'hidden'; event.currentTarget.nextElementSibling.hidden = false; }} />}
        <span className="depth-carousel__unavailable" hidden>Photo unavailable</span>
        <span className="depth-carousel__frame" aria-hidden="true">FRAME {String(i + 1).padStart(2, '0')}</span>
      </figure>)}
    </div>
    <div className="depth-carousel__details">
      <div className="depth-carousel__caption" aria-live="polite" aria-atomic="true"><span>{String(active + 1).padStart(2, '0')} / {count}</span><p>{items[active].caption}</p></div>
      <div className="depth-carousel__arrows"><button type="button" aria-label="Previous photo" disabled={active === 0} onClick={() => goTo(active - 1)}>←</button><button type="button" aria-label="Next photo" disabled={active === count - 1} onClick={() => goTo(active + 1)}>→</button></div>
    </div>
    <div className="depth-carousel__footer"><p>Swipe or drag · Use ← → keys</p><label>Jump to photo<select value={active} onChange={event => goTo(Number(event.target.value))}>{items.map((item, i) => <option key={item.id} value={i}>{String(i + 1).padStart(2, '0')} — {item.caption}</option>)}</select></label></div>
  </div>;
}
