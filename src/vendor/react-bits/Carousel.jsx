// Adapted from React Bits Carousel at 5d0c00e7594c898e989b250d022806961f4c8478.
// Copyright 2026 David Haz. MIT + Commons Clause; see LICENSE.md.
// Photo rendering, responsive sizing, manual controls, and reduced-motion support are local adaptations.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import './Carousel.css';

const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };
const VELOCITY_THRESHOLD = 500;
const clamp = (value, max) => Math.max(0, Math.min(value, max));

function CarouselItem({ item, index, active, itemWidth, trackItemOffset, x, reducedMotion }) {
  const [failed, setFailed] = useState(false);
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const rotateY = useTransform(x, range, [10, 0, -10]);
  return <motion.figure className="photo-carousel-item" aria-hidden={!active}
    style={{ width: itemWidth, rotateY: reducedMotion ? 0 : rotateY }}>
    <div className="photo-carousel-image">
      {failed ? <div className="photo-unavailable" role="img" aria-label={item.alt}>Photo unavailable</div> :
        <img src={item.src} alt={item.alt} width={item.width} height={item.height}
          loading={index === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" onError={() => setFailed(true)} />}
      <span className="photo-frame-number" aria-hidden="true">FRAME {String(index + 1).padStart(2, '0')}</span>
    </div>
  </motion.figure>;
}

export default function Carousel({ items, reducedMotion = false }) {
  const containerRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const [baseWidth, setBaseWidth] = useState(1);
  const [position, setPosition] = useState(0);
  const x = useMotionValue(0);
  const animationRef = useRef(null);
  const padding = baseWidth < 600 ? 12 : 24;
  const itemWidth = Math.max(1, (baseWidth - padding * 2) * (items.length > 1 ? .92 : 1));
  const trackItemOffset = itemWidth + GAP;
  const last = Math.max(0, items.length - 1);
  const activeIndex = clamp(position, last);
  const transition = reducedMotion ? { duration: 0 } : SPRING_OPTIONS;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => setBaseWidth(Math.max(1, container.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    animationRef.current?.stop();
    animationRef.current = animate(x, -activeIndex * trackItemOffset, reducedMotion ? { duration: 0 } : SPRING_OPTIONS);
    return () => animationRef.current?.stop();
  }, [activeIndex, trackItemOffset, reducedMotion, x]);

  useEffect(() => {
    // Keep the selected thumbnail visible without scrolling the whole page.
    const strip = thumbnailsRef.current;
    const thumb = strip?.children[activeIndex];
    if (!thumb) return;
    const left = thumb.offsetLeft;
    if (left < strip.scrollLeft) strip.scrollLeft = left;
    else if (left + thumb.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollLeft = left + thumb.offsetWidth - strip.clientWidth;
    }
  }, [activeIndex, baseWidth]);

  function goTo(next) { setPosition(clamp(next, last)); }

  function handleDragEnd(_, { offset, velocity }) {
    const threshold = Math.max(30, itemWidth * .08);
    const direction = offset.x < -threshold || velocity.x < -VELOCITY_THRESHOLD ? 1
      : offset.x > threshold || velocity.x > VELOCITY_THRESHOLD ? -1 : 0;
    const next = clamp(activeIndex + direction, last);
    if (next === activeIndex) {
      animationRef.current?.stop();
      animationRef.current = animate(x, -activeIndex * trackItemOffset, transition);
    } else goTo(next);
  }

  function handleKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const targets = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: last };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key]);
  }

  if (!items.length) return null;

  return <div ref={containerRef} className="photo-carousel" role="group" aria-roledescription="carousel"
    aria-label="Floorball photos" tabIndex="0" onKeyDown={handleKeyDown} data-active-photo={activeIndex + 1}>
    <div className="photo-carousel-viewport" style={{ padding: `0 ${padding}px` }}>
      <motion.div className="photo-carousel-track" drag={items.length > 1 ? 'x' : false}
        dragConstraints={{ left: -trackItemOffset * last, right: 0 }} dragElastic={reducedMotion ? 0 : .12}
        dragMomentum={false} dragDirectionLock onDragStart={() => animationRef.current?.stop()} onDragEnd={handleDragEnd}
        style={{ width: itemWidth, gap: GAP, perspective: 1000, perspectiveOrigin: `${activeIndex * trackItemOffset + itemWidth / 2}px 50%`, x }}>
        {items.map((item, index) => <CarouselItem key={item.id} item={item} index={index} active={activeIndex === index}
          itemWidth={itemWidth} trackItemOffset={trackItemOffset} x={x} reducedMotion={reducedMotion} />)}
      </motion.div>
    </div>
    <div className="photo-carousel-details">
      <div className="photo-carousel-caption" aria-live="polite" aria-atomic="true">
        <span className="photo-carousel-count">{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        <p>{items[activeIndex].caption}</p>
      </div>
      {items.length > 1 && <div className="photo-carousel-arrows">
        <button type="button" aria-label="Previous photo" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}>←</button>
        <button type="button" aria-label="Next photo" disabled={activeIndex === last} onClick={() => goTo(activeIndex + 1)}>→</button>
      </div>}
    </div>
    {items.length > 1 && <>
      <div ref={thumbnailsRef} className="photo-carousel-thumbnails" role="group" aria-label="Choose a photo">
        {items.map((item, index) => <button key={item.id} type="button" className="photo-carousel-thumbnail"
          aria-label={`Show photo ${index + 1}: ${item.caption}`} aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() => goTo(index)}>
          <img src={item.src} alt="" width="80" height="56" loading="lazy" draggable="false" />
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        </button>)}
      </div>
      <p className="photo-carousel-hint">Drag or swipe to browse · Arrow keys work too</p>
    </>}
  </div>;
}
