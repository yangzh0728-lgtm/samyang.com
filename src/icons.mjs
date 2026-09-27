// Fixed vector geometry avoids platform emoji fonts (including Apple Color Emoji).
const paths = {
  asterisk: 'M12 2v20M2 12h20M5 5l14 14M5 19L19 5',
  'arrow-up-right': 'M5 19L19 5M5 5h14v14',
  'arrow-down': 'M12 3v18M4 13l8 8 8-8',
  'arrow-up': 'M12 21V3M4 11l8-8 8 8',
  'arrow-left': 'M21 12H3M11 4l-8 8 8 8',
  'arrow-right': 'M3 12h18M13 4l8 8-8 8',
  play: 'M7 3l14 9-14 9Z',
  pause: 'M8 4v16M16 4v16',
  close: 'M5 5l14 14M5 19L19 5',
  undo: 'M9 4L3 10l6 6M3 10h11a7 7 0 0 1 7 7v3',
};
export function icon(name) {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="site-icon" data-icon="${name}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
}
const symbols = { '✳': 'asterisk', '✱': 'asterisk', '↗': 'arrow-up-right', '↓': 'arrow-down', '↑': 'arrow-up', '←': 'arrow-left', '→': 'arrow-right', '▶': 'play', '▷': 'play', 'Ⅱ': 'pause', '✕': 'close', '↶': 'undo' };
// Applied only to authored body markup, preserving attributes, URLs and scripts.
export function renderIconText(html) {
  return html.replace(/>([^<]*)</g, (_, text) => `>${text.replace(/[✳✱↗↓↑←→▶▷Ⅱ✕↶]\uFE0F?/gu, glyph => icon(symbols[glyph.replace('\uFE0F', '')]))}<`);
}
