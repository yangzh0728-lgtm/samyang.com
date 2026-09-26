// Direct manipulation stays available when automatic motion is paused.
export function createStickerWall() {
  const wall = document.querySelector('.sticker-wall');
  if (!wall) return;
  const stickers = [...wall.querySelectorAll('.interest-sticker')];
  const reset = document.querySelector('.sticker-reset');
  const status = document.querySelector('.sticker-status');
  const positions = new Map();
  let topLayer = 1;
  let activeDrag = null;

  const bounds = sticker => ({ x: Math.max(24, wall.clientWidth - sticker.offsetWidth - 24), y: Math.max(24, wall.clientHeight - sticker.offsetHeight - 24) });
  function place(sticker, x, y) {
    const limit = bounds(sticker);
    const left = Math.min(limit.x, Math.max(24, x));
    const top = Math.min(limit.y, Math.max(24, y));
    sticker.style.left = `${left}px`;
    sticker.style.top = `${top}px`;
    positions.set(sticker, { x: left / wall.clientWidth, y: top / wall.clientHeight });
  }
  function announce(sticker) {
    status.textContent = `${sticker.dataset.sticker} moved. Use arrow keys to move, Shift for bigger steps, or Home to reset this sticker.`;
  }
  function bringForward(sticker) {
    sticker.style.zIndex = ++topLayer;
  }
  function finishDrag(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const { sticker } = activeDrag;
    sticker.classList.remove('is-dragging');
    activeDrag = null;
    announce(sticker);
  }

  document.querySelector('#sticker-instructions').textContent = 'Drag a sticker. Or focus one and use arrow keys. Shift moves farther.';
  reset.hidden = false;
  stickers.forEach(sticker => {
    sticker.disabled = false;
    sticker.addEventListener('pointerdown', event => {
      if (activeDrag || !event.isPrimary || event.button !== 0) return;
      sticker.focus({ preventScroll: true });
      bringForward(sticker);
      activeDrag = { sticker, pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: sticker.offsetLeft, top: sticker.offsetTop };
      sticker.setPointerCapture(event.pointerId);
      sticker.classList.add('is-dragging');
    });
    sticker.addEventListener('pointermove', event => {
      if (!activeDrag || activeDrag.sticker !== sticker || activeDrag.pointerId !== event.pointerId) return;
      place(sticker, activeDrag.left + event.clientX - activeDrag.x, activeDrag.top + event.clientY - activeDrag.y);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => sticker.addEventListener(type, finishDrag));
    sticker.addEventListener('click', () => {
      bringForward(sticker);
      status.textContent = `${sticker.dataset.sticker} selected. Use arrow keys to move it, Shift for bigger steps, or Home to reset.`;
    });
    sticker.addEventListener('keydown', event => {
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (event.key === 'Home') {
        event.preventDefault();
        sticker.style.removeProperty('left');
        sticker.style.removeProperty('top');
        positions.delete(sticker);
        status.textContent = `${sticker.dataset.sticker} reset.`;
      } else if (directions[event.key]) {
        event.preventDefault();
        const [x, y] = directions[event.key];
        const step = event.shiftKey ? 30 : 10;
        bringForward(sticker);
        place(sticker, sticker.offsetLeft + x * step, sticker.offsetTop + y * step);
        announce(sticker);
      }
    });
  });

  reset.addEventListener('click', () => {
    positions.clear();
    topLayer = 1;
    stickers.forEach(sticker => {
      ['left', 'top', 'z-index'].forEach(property => sticker.style.removeProperty(property));
    });
    status.textContent = 'The sticker wall is back to its original layout.';
  });
  new ResizeObserver(() => {
    positions.forEach((position, sticker) => place(sticker, position.x * wall.clientWidth, position.y * wall.clientHeight));
  }).observe(wall);
}
