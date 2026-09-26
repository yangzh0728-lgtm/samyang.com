import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { profiles } from '../src/profiles.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [homeHero, workCards, editArt] = await Promise.all(
  ['home-hero.html', 'work.html', 'edit-art.html'].map(file => readFile(resolve(root, 'src', file), 'utf8'))
);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const paths = { story: '/about/', garage: '/work/legacy-garage/', engineering: '/work/engineering/', caliguide: '/work/caliguide/', sports: '/sports/', editing: '/editing/', interests: '/interests/' };
const names = { '/': 'Home', '/about/': 'About', '/work/': 'Work', '/sports/': 'Sports', '/editing/': 'Video editing', '/interests/': 'Off duty', '/work/legacy-garage/': 'Legacy Garage 26', '/work/engineering/': 'Engineering lab', '/work/caliguide/': 'CaliGuide' };

function header(current) {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="wordmark" href="/" aria-label="Sam Yang home">S<span>Y</span></a>
    <nav aria-label="Main navigation">${[['/work/', 'Work'], ['/about/', 'About'], ['/sports/', 'Sports'], ['/editing/', 'Editing']].map(([url, name]) => `<a href="${url}"${current === url || (url === '/work/' && current.startsWith(url)) ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav>
    <button class="motion-toggle" aria-pressed="false" aria-label="Pause animations"><span class="motion-symbol" aria-hidden="true">Ⅱ</span><span class="motion-label">Motion on</span></button>
  </header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-top"><p>KEEP LEARNING.<br>KEEP BUILDING.</p><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
    <nav class="footer-nav" aria-label="Explore the site">${['/', '/about/', '/work/', '/sports/', '/editing/', '/interests/'].map(url => `<a href="${url}">${names[url]}</a>`).join('')}</nav>
    <div class="footer-name" aria-hidden="true">Sam <em>Yang.</em></div><div class="footer-bottom"><span>© <span id="year">2026</span> SAM YANG</span><span>STUDENT. BUILDER. ATHLETE. CREATOR.</span><span>ALWAYS CURIOUS.</span></div></footer>`;
}

function documentPage({ path, title, description, content }) {
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#09070d"><meta name="description" content="${escape(description)}">
  <title>${escape(title)} — Sam Yang</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23b36bff'/%3E%3Ctext x='20' y='27' text-anchor='middle' font-family='Arial' font-size='21' font-weight='bold' fill='%2309070d'%3ESY%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;450;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <script>try{const p=sessionStorage.getItem('sam-motion');document.documentElement.classList.toggle('motion-static',p==='off'||(p!=='on'&&matchMedia('(prefers-reduced-motion: reduce)').matches));}catch{}</script>
  <link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script>
</head><body id="top" data-page="${path}">
${header(path)}<main id="main">${content}</main>${footer()}
</body></html>\n`;
}

function pageHero({ path, label, first, second, lede, chips = [] }) {
  const project = path.startsWith('/work/') && path !== '/work/';
  return `<section class="page-hero section-pad" aria-labelledby="page-title">
    <div class="hero-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>${project ? '<a href="/work/">Work</a><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${names[path]}</span></nav>
    <p class="eyebrow">${label}</p><h1 class="page-title" id="page-title"><span>${first}</span><em>${second}</em></h1>
    <div class="page-hero-bottom"><p>${escape(lede)}</p>${chips.length ? `<div class="tags">${chips.map(chip => `<span>${escape(chip)}</span>`).join('')}</div>` : ''}</div>
  </section>`;
}

function nextChapter(path, caption = 'KEEP EXPLORING') {
  return `<a class="next-chapter section-pad" href="${path}"><span class="eyebrow">${caption}</span><span class="next-chapter-title">${names[path]} <span aria-hidden="true">↗</span></span></a>`;
}

function storySections(sections, extra = '') {
  return `<div class="story-layout section-pad"><aside class="story-index"><p class="eyebrow">IN THIS CHAPTER</p><nav aria-label="On this page">${sections.map(([title], i) => `<a href="#${slug(title)}"><span>0${i + 1}</span>${escape(title)}</a>`).join('')}</nav></aside>
    <div class="story-content">${sections.map(([title, body], i) => `<section class="story-section reveal" id="${slug(title)}"><span class="eyebrow">0${i + 1}</span><h2>${escape(title)}</h2>${Array.isArray(body) ? `<ul class="story-list">${body.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(body)}</p>`}</section>`).join('')}${extra}</div></div>`;
}

function photo(file, alt, caption) {
  return `<figure class="chapter-photo reveal"><img src="/assets/${file}" alt="${escape(alt)}" width="1400" height="933"><figcaption>${caption} / EDITORIAL CONCEPT IMAGE</figcaption></figure>`;
}

const home = `${homeHero}
<section class="chapter-directory section-pad" id="explore" aria-labelledby="explore-title">
  <div class="section-kicker"><span class="eyebrow">PICK A CHAPTER</span><span class="eyebrow">THERE’S MORE TO THE STORY</span></div>
  <div class="section-heading reveal"><h2 id="explore-title">A few sides.<br><em>One me.</em></h2><p>Things I build. Things I love.<br>A place for each part of the story.</p></div>
  <div class="chapter-grid">
    <a class="chapter-card chapter-work reveal" href="/work/"><img src="/assets/corvair-purple.jpg" alt="" width="1400" height="933" loading="lazy"><span class="chapter-number">01 / WORK</span><div class="chapter-card-copy"><h3>Ideas into <em>action.</em></h3><p>Classic cars, engineering experiments, and a guide to finding your way.</p><span class="chapter-link">Explore three projects <b aria-hidden="true">↗</b></span></div><span class="chapter-concept">CONCEPT IMAGE</span></a>
    <a class="chapter-card chapter-about reveal" href="/about/"><span class="chapter-number">02 / ABOUT</span><div class="chapter-route" aria-hidden="true">HZ <span>→</span> CA<br><em>Always curious.</em></div><div class="chapter-card-copy"><h3>My <em>story.</em></h3><p>Hangzhou, Canada, California — and the curiosity that comes with me.</p><span class="chapter-link">Get to know me <b aria-hidden="true">↗</b></span></div></a>
    <a class="chapter-card chapter-sports reveal" href="/sports/"><img src="/assets/floorball-purple.jpg" alt="" width="1400" height="933" loading="lazy"><span class="chapter-number">03 / SPORTS</span><div class="chapter-card-copy"><h3>Always <em>in motion.</em></h3><p>Nine-plus years of floorball. Center, captain, and always a teammate.</p><span class="chapter-link">On and off the court <b aria-hidden="true">↗</b></span></div><span class="chapter-concept">CONCEPT IMAGE</span></a>
    <a class="chapter-card chapter-editing reveal" href="/editing/"><span class="chapter-number">04 / VIDEO EDITING</span><div class="mini-timeline" aria-hidden="true"><span></span><span></span><span></span><i></i></div><div class="chapter-card-copy"><h3>Cut to the <em>feeling.</em></h3><p>Finding a story in the footage, the rhythm, and the details.</p><span class="chapter-link">Behind the edit <b aria-hidden="true">↗</b></span></div></a>
    <a class="chapter-card chapter-play reveal" href="/interests/"><span class="chapter-number">05 / OFF DUTY</span><span class="play-mark" aria-hidden="true">✳</span><div class="chapter-card-copy"><h3>Room for <em>play.</em></h3><p>LEGO, writing, and following an idea just to see where it goes.</p><span class="chapter-link">The other things I love <b aria-hidden="true">↗</b></span></div></a>
  </div>
</section>`;

const aboutHero = pageHero({ path: '/about/', label: 'ABOUT / SAM YANG', first: 'Always', second: 'curious.', lede: profiles.story.lede, chips: ['Student', 'Builder', 'Athlete', 'Creator'] });
const about = `${aboutHero}<section class="about-journey section-pad" aria-labelledby="journey-title"><p class="eyebrow" id="journey-title">A FEW DIFFERENT PLACES</p><div class="journey reveal" aria-label="Hangzhou to Canada to California"><span>HANGZHOU</span><span aria-hidden="true">→</span><span>CANADA</span><span aria-hidden="true">→</span><span>CALIFORNIA</span></div><h2 class="intro-statement">I like turning <em>“what if”</em> into something <span class="intro-highlight">real.</span></h2></section>${storySections(profiles.story.sections)}<section class="values-strip section-pad" aria-label="What matters to me"><article><span>01 / CURIOSITY</span><h2>Ask why.</h2><p>Understanding how something works is often the start of the next idea.</p></article><article><span>02 / PRACTICE</span><h2>Try again.</h2><p>A prototype, a cut, a practice session — each version teaches me something.</p></article><article><span>03 / PEOPLE</span><h2>Build together.</h2><p>The people around a project matter just as much as the thing we’re making.</p></article></section>${nextChapter('/work/')}`;

const work = `${pageHero({ path: '/work/', label: 'WORK / THREE PLACES TO START', first: 'Ideas into', second: 'action.', lede: 'A classic car, a workbench full of possibilities, and a website built around everyday questions. Each project is a different way to learn by doing.', chips: ['Engineering', 'Entrepreneurship', 'Storytelling'] })}<section class="work section-pad" aria-label="Selected projects">${workCards}</section>${nextChapter('/sports/')}`;

const garage = `${pageHero({ path: paths.garage, label: 'PROJECT 01 / RESTORATION & STORYTELLING', first: 'Legacy', second: 'Garage 26.', lede: profiles.garage.lede, chips: profiles.garage.chips })}${photo('corvair-purple.jpg', 'Editorial concept of a silver classic Corvair in a workshop', 'THE CORVAIR')}${storySections(profiles.garage.sections, '<div class="story-note"><span class="eyebrow">THE THREAD CONNECTING IT ALL</span><p>A car is a machine, a piece of history, and a reason for people to come together.</p></div>')}${nextChapter(paths.engineering, 'NEXT PROJECT')}`;

const engineering = `${pageHero({ path: paths.engineering, label: 'PROJECT 02 / DESIGN · BUILD · TEST', first: 'The engineering', second: 'lab.', lede: profiles.engineering.lede, chips: profiles.engineering.chips })}<div class="process-banner section-pad reveal" aria-label="Sketch, build, test, repeat"><span>SKETCH.</span><span>BUILD.</span><span>TEST.</span><em>Repeat.</em></div>${storySections(profiles.engineering.sections)}<section class="values-strip section-pad" aria-label="Ways I explore engineering"><article><span>MECHANISMS</span><h2>Make it move.</h2><p>Robotics and servo systems connect an idea to movement in the real world.</p></article><article><span>CAD + PRINTING</span><h2>Give it form.</h2><p>A digital model is a way to think through a part before making a physical version.</p></article><article><span>TESTING</span><h2>Learn from it.</h2><p>Physics experiments and prototypes turn assumptions into questions I can test.</p></article></section>${nextChapter(paths.caliguide, 'NEXT PROJECT')}`;

const caliguide = `${pageHero({ path: paths.caliguide, label: 'PROJECT 03 / A NEW PLACE, A CLEARER START', first: 'Finding your way', second: 'with CaliGuide.', lede: profiles.caliguide.lede, chips: profiles.caliguide.chips })}<div class="guide-banner section-pad reveal"><span class="eyebrow">EVERYDAY QUESTIONS. A PLACE TO START.</span><p>New place.<br><em>A little more familiar.</em></p><div class="tags"><span>Transportation</span><span>Housing</span><span>Banking</span><span>Education</span><span>Healthcare</span></div></div>${storySections(profiles.caliguide.sections)}${nextChapter('/editing/')}`;

const sports = `${pageHero({ path: '/sports/', label: 'SPORTS / ON AND OFF THE COURT', first: 'Always', second: 'in motion.', lede: profiles.sports.lede, chips: ['Floorball', 'Center', 'Team captain'] })}<section class="sports-feature section-pad" aria-label="Floorball profile"><div class="sports-feature-stat"><span>9<em>+</em></span><p>YEARS OF FLOORBALL</p><h2>Center. Captain.<br>Always a teammate.</h2></div>${photo('floorball-purple.jpg', 'Editorial concept of a floorball stick and ball on a dark court', 'FLOORBALL')}</section>${storySections(profiles.sports.sections)}${nextChapter('/editing/')}`;

const editing = `${pageHero({ path: '/editing/', label: 'VIDEO EDITING / PICTURE + SOUND', first: 'Finding', second: 'the feeling.', lede: profiles.editing.lede, chips: ['Visual storytelling', 'Rhythm & pacing', 'Sound & color'] })}<section class="editing-feature section-pad" aria-labelledby="edit-feature-title">${editArt}<div class="editing-feature-copy reveal"><p class="eyebrow">A DIFFERENT WAY TO BUILD</p><h2 id="edit-feature-title">Every cut<br><em>counts.</em></h2><p>It’s where my technical curiosity meets my creative side — a chance to shape how a story looks, sounds, and feels.</p></div></section>${storySections(profiles.editing.sections)}${nextChapter('/interests/')}`;

const interests = `${pageHero({ path: '/interests/', label: 'OFF DUTY / THE OTHER THINGS I LOVE', first: 'Room', second: 'for play.', lede: 'LEGO, writing, and following an idea just to see where it goes. Some things don’t need a bigger reason.', chips: ['LEGO', 'Writing', 'Curiosity'] })}<div class="play-banner section-pad reveal"><span aria-hidden="true">✳</span><p>Build it.<br>Take it apart.<br><em>Try something else.</em></p></div>${storySections([
  ['LEGO', 'I love LEGO for the possibilities in a handful of pieces. It’s a place to build, take something apart, and try a different idea simply because I’m curious where it might go.'],
  ['Writing and ideas', 'Writing gives me another way to explore the things I care about. Engineering, moving between places, sports, and the people behind a project all leave me with questions worth thinking through.'],
  ['Following curiosity', 'Not everything needs to become a finished project. I like making room for the ideas that begin as play — a different way to build something, a story to tell, or a question I want to follow.']
])}${nextChapter('/about/')}`;

const pages = [
  ['/', 'Always Curious', 'Sam Yang — student, builder, athlete, and creator. Explore my projects, story, sports, video editing, and interests.', home],
  ['/about/', 'About', profiles.story.lede, about],
  ['/work/', 'Selected Work', 'Explore Legacy Garage 26, the Engineering Lab, and CaliGuide — projects by Sam Yang.', work],
  [paths.garage, 'Legacy Garage 26', profiles.garage.lede, garage],
  [paths.engineering, 'Engineering Lab', profiles.engineering.lede, engineering],
  [paths.caliguide, 'CaliGuide', profiles.caliguide.lede, caliguide],
  ['/sports/', 'Sports', profiles.sports.lede, sports],
  ['/editing/', 'Video Editing', profiles.editing.lede, editing],
  ['/interests/', 'Off Duty', 'LEGO, writing, and the other things Sam Yang loves.', interests]
];
for (const [path, title, description, content] of pages) {
  const directory = resolve(root, 'dist', `.${path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), documentPage({ path, title, description, content }));
}
console.log(`Built ${pages.length} static pages.`);
