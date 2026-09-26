# Sam Yang — Always Curious

A traditional, animated personal portfolio inspired by the direct personal introduction at timmy.li and the oversized editorial typography, electric purple accents, and sports energy at landonorris.com.

The rejected 3D viewer, geometry, camera controls, raycasting logic, vendor dependencies, and dedicated tests have been removed. The garage survives only as the name of Sam's real restoration project, Legacy Garage 26.

## Run

`python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`

Open http://127.0.0.1:4173. No installation or build is required.

## Edit

- Page content: `dist/index.html`.
- Layout, type, responsive behavior, and animations: `dist/styles.css`.
- Full project and personal stories, dialogs, motion control, section reveals: `dist/app.js`.
- Images: `dist/assets/corvair-purple.jpg` and `dist/assets/floorball-purple.jpg`.

## Interactions and accessibility

Navigation anchors scroll to Work, About, Sports, and Editing. Project buttons open native modal dialogs with Escape dismissal, focus containment and focus restoration. Existing `#profile/garage`, `#profile/engineering`, `#profile/caliguide`, `#profile/sports`, and `#profile/story` URLs remain supported; `#profile/editing` opens the video-editing story.

The ticker, entrance animations, scroll reveals, editing timeline, rotating accent, and hover transitions respect reduced-motion preferences and the visible motion toggle. Core summaries and biography remain readable without JavaScript. The editing timeline is decorative; it does not imply a playable showreel.

## Content and artwork

Biography and project details use Sam's supplied notes. The two photographic-style images are generated editorial concepts, labeled as such on the page; they are not photographs of Sam's actual vehicle, equipment, or restoration results. No portrait, awards, contact address, or social accounts were invented.
