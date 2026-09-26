# Sam Yang — Always Curious

A personal portfolio with concise résumé-style entries for work, education, and sports. Black and electric purple, stencil typography, paper textures, acid-green accents, and ten official React Bits animation components.

## Pages

- `/` — a concise introduction and visual chapter directory.
- `/about/` — background, education, and languages.
- `/work/` — grouped projects, engineering competitions, student leadership, and skills.
- `/sports/` — floorball and badminton roles and results, plus other sports.
- `/editing/` — video editing, pacing, and visual storytelling.
- `/interests/` — LEGO, writing, and curiosity outside the main projects.

There are six content pages. Work covers each project directly in a short entry with a role, period, and key contributions. The former `/work/legacy-garage/`, `/work/engineering/`, and `/work/caliguide/` routes redirect to the appropriate overview entry. There are no individual project detail pages.

Every route is a static HTML document, so direct links, refresh, browser history, navigation, and content work without client-side routing. Older homepage section/profile hashes redirect to their corresponding pages when JavaScript is enabled.

## Build and run

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4173/. The site is static HTML with locally bundled React animation islands. Node.js 22+ and Python 3 are required for the build and preview commands.

## Deploy with Vercel

Import `yangzh0728-lgtm/samyang.com` from GitHub and keep the repository root (`./`) as the Root Directory. `vercel.json` configures the Other framework preset, `npm ci`, `npm run build`, and the `dist` output directory. No environment variables are required. The production branch is `main`; once the GitHub integration is connected, pushes to it deploy automatically.

Add the custom domain under the Vercel project's Settings → Domains. If DNS is managed at GoDaddy, copy the exact A/CNAME values Vercel shows into GoDaddy DNS, then verify the domain in Vercel. Keep existing mail and verification records. Vercel provisions HTTPS after domain verification.

## Edit

- Shared page layout, navigation, and page-specific sections: `scripts/build-pages.mjs`.
- Résumé entries, education, sports results, skills, and languages: `src/resume.mjs`.
- Short biography and editing copy: `src/profiles.mjs`.
- Homepage hero, chapter directory, and editing artwork: `src/*.html`.
- Shared styling: `dist/styles.css`.
- Motion preferences, scroll entrances, and old-link compatibility: `src/app.js`.
- React Bits mounting, pause/resume, and responsive effects: `src/motion/`.
- Pinned upstream components and license: `src/vendor/react-bits/`.
- The esbuild animation bundle: `scripts/build-motion.mjs`.

Run `npm run build` after changing source, templates, or profile copy. Generated `dist/**/index.html` files are committed for static hosting.

## Motion and accessibility

The site uses the official [React Bits](https://www.reactbits.dev/) source for Aurora, BlurText, GlitchText, DecryptedText, RotatingText, ScrollVelocity, SpotlightCard, TiltedCard, Magnet, and ClickSpark. Upstream is pinned and licensed in `src/vendor/react-bits/README.md`. React, Motion, and OGL are bundled locally; there is no runtime component CDN.

The interests page has a draggable sticker wall (`src/interactions/sticker-wall.js`). Mouse and touch use pointer capture; keyboard users can move a focused sticker with arrow keys, use Shift for larger steps, or press Home to reset it. A reset button restores the whole board. Manual movement remains available with motion off, and positions stay inside the board when it resizes.

The homepage has a moving violet Aurora, blurred letter entrances, a rotating role label, a scroll-responsive ribbon, a spotlight chapter list with tilting thumbnails, a magnetic link, and click sparks. Inner pages share the Aurora, decrypting labels, blurred heading entrances, and click sparks; résumé entries also have a pointer spotlight.

Motion off restores static HTML, removes animation roots and canvases, and carries between pages for the session. OS reduced motion sets the default. Continuous effects unmount outside the viewport and in hidden tabs. Click sparks render only while active. Touch uses ordinary tap navigation without card tilt. The background has a non-WebGL fallback, and all six pages remain readable without JavaScript. Native links, skip links, breadcrumbs, active navigation, and category anchors remain intact.

## Content and artwork

Professional and educational facts come from Sam's supplied résumé screenshot; personal interests and creative copy build on prior instructions. The résumé establishes 11+ years of floorball and supplies the listed competition results. The source image, original Word file, phone number, and email are not bundled with the website.

The car and floorball images are labeled editorial concepts, not photos of Sam's actual vehicle or equipment. The video-editing timeline is decorative, not a playable showreel. No awards, project results, or software expertise were invented.
