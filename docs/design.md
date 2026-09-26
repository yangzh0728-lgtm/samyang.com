# Sam Yang — Always Curious

## Current structure: grouped résumé overview

Sam clarified that each broad section should be a page, while individual projects should be covered briefly within their category. The Work page follows the clear title, role/context, and concise description approach of Timmy Li's experience listing, with Sam's own black/purple styling. It contains six entries grouped into Projects & Entrepreneurship, Engineering & Innovation, and Student Leadership, followed by Skills. Category links navigate within the page; entries do not open detailed project pages.

The supplied résumé screenshot is the factual source for roles, dates/grade periods, engineering competitions and recognition, education, languages, and sports results. The original Word file could not be read from its WeChat container; the later user-supplied screenshot resolved the content dependency. Contact data and original source files are not published. About now includes four education entries and languages; Sports covers floorball and badminton, including the corrected 11+ years of floorball.

Six content pages remain. The three former project routes are small redirects to the corresponding Work entry, and old homepage profile hashes target those same overview anchors. `src/resume.mjs` contains the structured résumé facts. `scripts/check-pages.py` verifies the six-page/three-redirect structure, category and entry IDs, local links, and updated sports tenure.

## Earlier structure: separate project pages

The user asked to give each section a detailed page. The homepage is now an overview with five chapter links. Separate static pages cover About, Work, Sports, Video Editing, and Off Duty. Work links to individual Legacy Garage 26, Engineering Lab, and CaliGuide pages, for nine HTML routes including Home.

Each detailed story has an introduction, existing profile content presented as full sections, a table of contents, and a next-chapter link. Shared navigation, footer links, breadcrumbs, and active section styling make the page hierarchy clear. The old modal UI and event handlers are removed. Old section and profile hashes redirect to their corresponding pages, while native links handle normal navigation and browser history.

Templates live in `scripts/build-pages.mjs` and `src/`. Generated static HTML is committed in `dist/`. The shared motion module tolerates pages without a homepage hero or biography. Motion preferences persist in session storage, with a pre-paint reduced-motion check on each page. No new personal achievements or project results were added.

Verified all nine routes' local links, assets, anchors, and heading structure using `scripts/check-pages.py`. Browser checks covered navigation between chapters and projects, project table-of-contents anchors, direct page refresh, browser Back, old profile-link redirection, and motion preference persistence. Desktop and mobile layouts were visually reviewed; checked 320px and 390px widths for overflow. Browser console reported no errors or warnings.

The entries below record the earlier iterations of the design.

## Current direction

The user rejected the 3D garage and explicitly requested a traditional site referencing https://www.timmy.li/ and https://landonorris.com/. Both references were inspected in the browser. Timmy's direct introduction and minimal navigation informed the structure. Lando's scale, mixed typography, and athlete-oriented editorial sections informed the visual design; Sam selected the final black and purple palette. No reference artwork or branding was copied.

## Implementation

- Semantic scrolling portfolio: name-led hero, biography, selected work, sports, personal interests and footer.
- Black and deep violet sections, electric purple accents, pale neutral text; DM Sans, Instrument Serif and Barlow Condensed.
- All five existing full profiles retained as accessible native dialogs, plus a video-editing profile.
- Entrance animations, marquee, scroll reveals, hover treatments and optional motion.
- All 3D components, vendored Three.js files and obsolete interaction tests deleted.
- LEGO passion remains in the personal-interests text.
- Two generated editorial concept images; no invented personal photographs or contact details.

## Verification

- All five profile buttons open the matching heading; Escape closes each dialog.
- 390px layout has no horizontal page overflow. Mobile sports dialog is 352px wide.
- Both editorial images load successfully.
- No canvas or WebGL script is present. Browser console has no errors or warnings.
- Motion off removes the ticker animation. Keyboard focus returns to the opening control.
- JavaScript syntax and local asset-reference checks pass.

## Artwork

Corvair source: /Users/mac/.codex/generated_images/01a0dc55-5f3b-7083-a9f5-cc60c9725ee4/exec-5c6dcffc-bf68-4d33-97f6-f462d9a28a80.png
Floorball source: /Users/mac/.codex/generated_images/01a0dc55-5f3b-7083-a9f5-cc60c9725ee4/exec-ec0c71c4-3ece-416b-88c4-59bffc65fe02.png

Original images produced by built-in imagegen and converted to optimized JPEGs using sips. Concept captions remain visible on the site.

## Black and purple update

User requested black and purple for a cool punk feel. Replaced cream sections with deep violet-black, moved all accent tokens to electric purple, updated cards, dialogs, favicon, focus styles, and sharpened the arrow controls. Existing layout, content and animations are retained.

Both editorial concepts were edited with imagegen to replace lime lighting and court markings with violet. Edited source images: `/private/tmp/sam-purple-assets/corvair-editorial-purple.png` and `/private/tmp/sam-purple-assets/floorball-editorial-purple.png`. Final JPEGs retain 1400 × 933 dimensions.

Main text color pairings have contrast ratios of at least 6.1:1, including purple-on-black and text over the solid purple section.

## Video editing

Sam requested that the portfolio show his passion for video editing. A dedicated section after Sports pairs oversized editorial type with a decorative purple editing timeline. A moving playhead follows the site's motion control and reduced-motion preference. The new Editing navigation link and Behind the edit button lead to the section and an accessible profile dialog. The biography also includes this interest. Copy describes the passion without inventing specific software, films, clients, or achievements; no playable showreel is implied.

Verified the desktop and 390px section visually, and confirmed no horizontal overflow at 390px or 320px. The new dialog opens with the correct heading, Escape closes it and returns focus, and the motion toggle disables the playhead animation. Navigation fits at 320px. JavaScript syntax and diff whitespace checks pass; the browser reported no errors or warnings.

## React Bits motion direction

User supplied React Bits as an animation reference. Inspected the live examples and configuration for:

- [Split Text](https://www.reactbits.dev/text-animations/split-text): staggered name-letter entrance.
- [Scroll Reveal](https://www.reactbits.dev/text-animations/scroll-reveal): biography words sharpen and brighten with scroll progress, preserving the italic phrase and purple highlight.
- [Spotlight Card](https://www.reactbits.dev/components/spotlight-card): pointer-positioned violet light on project covers and the editing artwork.
- [Magnet](https://www.reactbits.dev/animations/magnet): restrained magnetic movement on action arrows, with stable button hit areas.
- [Aurora](https://www.reactbits.dev/backgrounds/aurora): slow violet light behind the hero typography, interpreted with CSS gradients.

The implementation is original JavaScript/CSS rather than copied React component source. It preserves the traditional scrolling layout, contains no 3D scene or canvas, and introduces no external dependencies. Name and biography accessible labels remain intact. Motion off cancels Web Animations, clears pointer effects, and restores readable words; OS reduced motion sets the initial paused state. The hero background pauses when out of view and CSS animations pause when the page is hidden.

Verified progressive and complete biography states in the browser, the pointer spotlight, the hero's out-of-view pause, the editing profile dialog, and motion-off styles. Desktop and 390px hero screenshots reviewed; no page overflow at 390px or 320px. Both JavaScript modules pass syntax checks. Browser console has no errors or warnings.
