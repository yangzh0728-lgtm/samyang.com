# Sam Yang — Always Curious

A personal portfolio with concise résumé-style entries for work, education, and sports. Black and electric purple, editorial typography, and motion inspired by React Bits.

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
node scripts/build-pages.mjs
python3 scripts/check-pages.py
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173/. No package installation is required.

## Edit

- Shared page layout, navigation, and page-specific sections: `scripts/build-pages.mjs`.
- Résumé entries, education, sports results, skills, and languages: `src/resume.mjs`.
- Short biography and editing copy: `src/profiles.mjs`.
- Reusable homepage hero and editing artwork: `src/*.html`.
- Shared styling: `dist/styles.css`.
- Motion preferences, scroll entrances, and old-link compatibility: `dist/app.js`.
- React Bits-inspired typography, spotlights, and magnetic arrows: `dist/motion.js`.

Run the build after changing templates or profile copy. Generated `dist/**/index.html` files are committed for static hosting.

## Motion and accessibility

Motion ideas draw on [React Bits](https://www.reactbits.dev/): Split Text, Scroll Reveal, Spotlight Card, Magnet, and Aurora. These are original JavaScript/CSS adaptations, with no React, GSAP, WebGL, or third-party component code added. Motion off carries between pages for the session and cancels entrances, animated backgrounds, and pointer effects. OS reduced motion sets the default. Native links, skip links, breadcrumbs, active navigation, and page tables of contents support navigation.

## Content and artwork

Professional and educational facts come from Sam's supplied résumé screenshot; personal interests and creative copy build on prior instructions. The résumé establishes 11+ years of floorball and supplies the listed competition results. The source image, original Word file, phone number, and email are not bundled with the website.

The car and floorball images are labeled editorial concepts, not photos of Sam's actual vehicle or equipment. The video-editing timeline is decorative, not a playable showreel. No awards, project results, or software expertise were invented.
