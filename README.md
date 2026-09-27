<p align="center">
  <img src="dist/assets/sam-yang-logo.png" alt="Sam Yang logo" width="180" height="180">
</p>

# Sam Yang — Always Curious

My personal website: a place for the things I build, the sports I play, and the stories I want to tell. Engineering, entrepreneurship, video editing, LEGO, and travel — brought together with a black-and-purple, punk-inspired design.

**[Visit the website](https://samyangzh.com/)**

## Inside the site

| Page | What’s there |
| --- | --- |
| [Home](https://samyangzh.com/) | An introduction, rotating roles, background quotes, and a directory of chapters. |
| [About](https://samyangzh.com/about/) | My background, from Hangzhou to Toronto to Los Angeles, and my education. |
| [Work](https://samyangzh.com/work/) | Projects, engineering competitions, leadership, and skills, grouped into concise résumé entries. |
| [Sports](https://samyangzh.com/sports/) | Badminton and floorball, a floorball photo gallery, and the other sports I enjoy. |
| [Video editing](https://samyangzh.com/editing/) | Visual storytelling, pacing, sound, and the ideas behind an edit. |
| [Off duty](https://samyangzh.com/interests/) | LEGO, writing, and a draggable sticker wall. |
| [Travel](https://samyangzh.com/travel/) | A world map highlighting the countries I’ve visited, with a country count and travel list. |

Each page has its own URL and static HTML. Projects are covered together on the Work page; older project URLs redirect to the matching section.

## Design and interactions

- Electric purple, black backgrounds, stencil type, paper grain, and small acid-green accents.
- A custom logo in the header and favicon, with a “sun_rain / Always curious” stamp in the compact mobile header. The About introduction connects my online nickname to my name.
- A homepage aurora and subtle purple Ferrofluid backgrounds in inner-page headers, plus rotating role text, glitch effects, scroll-responsive type, spotlight cards, tilting thumbnails, and click sparks.
- Page transitions, headings, and section entrances use gentle fades without shaking the layout.
- A flowing mouse ribbon that fades out within 0.45 seconds of inactivity; touch input does not create a trail.
- Faint animated English quotes behind the homepage introduction.
- Stickers that support dragging, touch, and keyboard movement. Arrow keys move a focused sticker, Shift increases the step, and Home resets it.
- A floorball gallery based on React Bits Depth Carousel, with a receding photo stack, swipe/drag navigation, arrows, and captions. It includes 32 personal floorball photos covering games, teams, and tournament memories.
- An SVG world map with a country picker, visited-country highlights, and a shared count and list.

The **Motion on/off** control works across pages for the current session. The site respects the operating system’s reduced-motion preference by default. Core content and navigation remain available without JavaScript, and decorative overlays do not block links or buttons.

## Stack

The site combines generated HTML and CSS with small React animation islands. It uses **React**, **Motion**, **OGL**, and locally bundled **React Bits** components. **esbuild** creates the browser bundle. **D3 Geo**, **TopoJSON Client**, and **World Atlas** generate the travel map at build time.

There is no application backend, database, map API key, or required environment variable. Fonts load from Google Fonts; animation components are bundled locally.

## Run locally

Requirements: **Node.js 22 or newer**, npm, and **Python 3**.

```sh
git clone https://github.com/yangzh0728-lgtm/samyang.com.git
cd samyang.com
npm ci
npm run build
npm run check
npm run preview
```

Open [the local preview](http://127.0.0.1:4173/). Stop the server with `Ctrl+C`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Bundle the animation code and generate seven pages plus three legacy redirects. |
| `npm run check` | Check page structure, local links, assets, anchors, and travel-map data. |
| `npm run preview` | Serve `dist/` locally on port 4173. |

The preview is a static server, with no automatic rebuild or hot reload. After editing source files, run `npm run build` and refresh the browser.

## Where to edit

| Change | File or directory |
| --- | --- |
| Shared header, footer, navigation, and page layouts | [`scripts/build-pages.mjs`](scripts/build-pages.mjs) |
| Homepage name, introduction, location, and quotes | [`src/home-hero.html`](src/home-hero.html) |
| Homepage chapter order and descriptions | [`src/chapter-directory.html`](src/chapter-directory.html) |
| Work entries, education, sports results, and skills | [`src/resume.mjs`](src/resume.mjs) |
| Biography and video-editing copy | [`src/profiles.mjs`](src/profiles.mjs) |
| Rotating roles, cursor trail, and React animation setup | [`src/motion/portfolio.jsx`](src/motion/portfolio.jsx) |
| Punk styling, responsive logo, and header stamp | [`src/motion/zine.css`](src/motion/zine.css) |
| Chapter, sticker, quote, and map styles | [`src/motion/`](src/motion/) |
| Motion preferences and legacy homepage links | [`src/app.js`](src/app.js) |
| Sticker, quote, and map interactions | [`src/interactions/`](src/interactions/) |
| Floorball photos and captions | [`src/galleries/floorball.mjs`](src/galleries/floorball.mjs) |
| Gallery markup and validation | [`scripts/photo-gallery.mjs`](scripts/photo-gallery.mjs) |
| Visited countries | [`src/travel.mjs`](src/travel.mjs) |
| Map generation | [`scripts/travel-map.mjs`](scripts/travel-map.mjs) |
| Logo, images, and textures | [`dist/assets/`](dist/assets/) |
| Base stylesheet | [`dist/styles.css`](dist/styles.css) |

**`dist/` contains both generated files and maintained assets.** Do not delete it as a disposable build folder: `dist/assets/` and `dist/styles.css` are maintained directly. Edit templates and source files rather than generated page HTML or `dist/app.js` / `dist/app.css`.

After a website change, rebuild and check it, then commit the source changes together with the updated generated files in `dist/`.

### Add a visited country

Update `visitedCountryIds` in [`src/travel.mjs`](src/travel.mjs) with the map’s three-digit ISO numeric IDs as strings, preserving leading zeros. Use IDs from the World Atlas dataset used by the map. Add only confirmed visits.

Rebuilding updates the highlights, count, and country list together. Repeat trips count once; broad regions need specific country names before they can be added. Duplicate or unknown IDs fail the build. Selecting a country in the browser only inspects it; it does not change the travel log.

### Add floorball photos

Original photos belong in the local media library (`media/photos/floorball/` beside the website checkout). That folder stays outside Git and is not published automatically.

Copy selected, prepared images to `dist/assets/floorball/`, then add their metadata to `src/galleries/floorball.mjs`: a unique `id`, local `src`, descriptive `alt` text, `caption`, and original `width` / `height`. Run the build and checks. Empty galleries show “Coming soon”; a single photo needs no navigation controls, and multiple photos enable the carousel. Portrait images are shown in full rather than cropped. Without JavaScript, photos remain available in a horizontally scrolling gallery.

The carousel is manually controlled. Motion off keeps browsing available with immediate transitions and preserves the selected photo. The local photo folders and their contents are not copied into a deployment by the build.

## Deployment

[`vercel.json`](vercel.json) configures the repository for static deployment on Vercel:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Framework | Other / no framework preset |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Trailing slashes | Enabled |

Use `main` as the production branch when connecting the GitHub repository. Automatic deployment depends on that integration being enabled. The built `dist/` directory can also be served by a static host that supports directory index pages.

## Artwork and credits

The car and floorball images are labeled **editorial concept images**. The editing timeline is decorative; it is not a playable showreel. Personal photos and footage can replace those assets as they become available.

Animation components come from [React Bits](https://www.reactbits.dev/): Aurora, BlurText, GlitchText, DecryptedText, RotatingText, ScrollVelocity, SpotlightCard, TiltedCard, Magnet, ClickSpark, Ribbons, Carousel, and DepthCarousel. Their pinned upstream revision and local adaptations are recorded in the [vendor README](src/vendor/react-bits/README.md). Their license is included in the [vendor directory](src/vendor/react-bits/LICENSE.md) and the [published bundle](dist/react-bits-license.txt).

Map boundaries come from Natural Earth via the pinned World Atlas package; attribution is also shown on the Travel page. Fonts: DM Sans, Barlow Condensed, and Black Ops One.
