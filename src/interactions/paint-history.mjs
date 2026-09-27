// Keep canvas undo memory bounded, including on high-density mobile screens.
export function createPaintHistory({ maxBytes = 24 * 1024 * 1024, maxEntries = 12 } = {}) {
  const frames = [];
  let bytes = 0;
  return {
    push(frame) {
      const size = frame.data.byteLength;
      if (size > maxBytes) { frames.length = 0; bytes = 0; return; }
      while (frames.length && (frames.length >= maxEntries || bytes + size > maxBytes)) bytes -= frames.shift().data.byteLength;
      frames.push(frame); bytes += size;
    },
    pop() { const frame = frames.pop(); if (frame) bytes -= frame.data.byteLength; return frame; },
    clear() { frames.length = 0; bytes = 0; }
  };
}
