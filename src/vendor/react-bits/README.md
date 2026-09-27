# React Bits components used in this website

Source: https://github.com/DavidHDev/react-bits
Pinned revision: `5d0c00e7594c898e989b250d022806961f4c8478`
Upstream component directory: `src/content/`
License: MIT + Commons Clause, copyright 2026 David Haz. See `LICENSE.md`; the deployment also includes `/react-bits-license.txt`.

Included components: Aurora, Ferrofluid, BlurText, GlitchText, DecryptedText, RotatingText, ScrollVelocity, SpotlightCard, TiltedCard, Magnet, ClickSpark, Ribbons, Carousel. These are used as part of Sam's website, not distributed as a standalone component library.

Local changes:
- Aurora: WebGL 2 availability check, a single existing canvas, pixel ratio capped at 1, antialias disabled. The site supplies a static background fallback and unmounts the renderer offscreen or while the tab is hidden.
- Ferrofluid: adapted from the pinned `src/content/Backgrounds/Ferrofluid/` source. Preserves the original fluid shader; adds a WebGL availability check, capped pixel ratio, no antialiasing, a 30fps limit, context-loss fallback, and GPU context cleanup. Inner-page headers use a slow purple palette with masked opacity and no pointer interception. The existing motion lifecycle unmounts it when paused, offscreen, or in a hidden tab.
- BlurText: configurable outer element to preserve valid heading markup.
- GlitchText: configurable outer element for inline heading text.
- ScrollVelocity: optional stepped positioning for the stuttering paper ribbon.
- TiltedCard: optional image so the same component can frame text-only chapter cards.
- ClickSpark: optional document pointer events, and on-demand frame scheduling that stops when the last spark expires.
- Ribbons: global mouse-only pointer tracking, per-ribbon widths, deterministic offsets, guarded shader normalization, transparent blending, WebGL availability check, DPR capped at 1, idle fade and frame-loop suspension, pointer-exit cleanup, and GPU context cleanup. The site's motion lifecycle disables it on touch devices, when paused, and in hidden tabs.
- Carousel: adapted from the pinned `src/content/Components/Carousel/` source into a photo slider, retaining Motion springs, drag gestures, and perspective transforms. Removed demo icons and autoplay; added responsive sizing, photo captions and thumbnails, previous/next controls, keyboard navigation, image-error handling, and reduced-motion updates that preserve the selected photo.
- All components: site-level pause/resume lifecycle and responsive styling live in `src/motion/`.
