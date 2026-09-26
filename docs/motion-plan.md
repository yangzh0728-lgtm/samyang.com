# React Bits motion pass

Give the black-and-purple portfolio a visibly animated identity while preserving the six pages and concise résumé content. The first screen should show a bright, fluid violet Aurora behind Sam's name, with a rotating builder/athlete/creator/video-editor line. Headings reveal from blur; labels decrypt; the ribbon responds to scroll velocity. Chapter cards tilt and glow, links attract the pointer, and clicks create small violet sparks.

Use official React Bits components pinned to upstream commit `5d0c00e7594c898e989b250d022806961f4c8478`, retaining the license. React islands enhance existing static HTML, bundled locally with esbuild. Content and navigation stay available before JavaScript loads and when motion is disabled. Pause controls unmount effects and restore original content. Continuous effects suspend offscreen or in hidden tabs. Touch retains entrance/background effects and ordinary tap navigation.

Implementation sequence:
1. Vendor Aurora and set up a pinned dependency/build pipeline; show the first meaningful preview.
2. Add BlurText, DecryptedText, RotatingText, ScrollVelocity, SpotlightCard, TiltedCard, Magnet, and ClickSpark using a shared lifecycle controller.
3. Style the motion to suit the existing typography and purple palette. Preserve small-screen readability and category navigation.
4. Validate generated links, browser navigation, desktop/mobile layouts, motion pause/resume, and missing-WebGL fallback. Publish and push the finished commit to GitHub.
