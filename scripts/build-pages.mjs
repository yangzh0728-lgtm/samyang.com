import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { profiles } from '../src/profiles.mjs';
import { experienceGroups, education, sportsExperience, skills, languages } from '../src/resume.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [homeHero, editArt] = await Promise.all(
  ['home-hero.html', 'edit-art.html'].map(file => readFile(resolve(root, 'src', file), 'utf8'))
);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const names = { '/': 'Home', '/about/': 'About', '/work/': 'Work', '/sports/': 'Sports', '/editing/': 'Video editing', '/interests/': 'Off duty' };

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
  <link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/app.css"><script type="module" src="/app.js"></script>
</head><body id="top" data-page="${path}"${['/about/', '/work/', '/sports/'].includes(path) ? ' class="resume-page"' : ''}>
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
    <a class="chapter-card chapter-work reveal" href="/work/"><img src="/assets/corvair-purple.jpg" alt="" width="1400" height="933" loading="lazy"><span class="chapter-number">01 / WORK</span><div class="chapter-card-copy"><h3>Work & <em>experience.</em></h3><p>Engineering projects, competition teams, and student leadership.</p><span class="chapter-link">View my experience <b aria-hidden="true">↗</b></span></div><span class="chapter-concept">CONCEPT IMAGE</span></a>
    <a class="chapter-card chapter-about reveal" href="/about/"><span class="chapter-number">02 / ABOUT</span><div class="chapter-route" aria-hidden="true">HZ <span>→</span> CA<br><em>Always curious.</em></div><div class="chapter-card-copy"><h3>My <em>story.</em></h3><p>Hangzhou, Canada, California — and the curiosity that comes with me.</p><span class="chapter-link">Get to know me <b aria-hidden="true">↗</b></span></div></a>
    <a class="chapter-card chapter-sports reveal" href="/sports/"><img src="/assets/floorball-purple.jpg" alt="" width="1400" height="933" loading="lazy"><span class="chapter-number">03 / SPORTS</span><div class="chapter-card-copy"><h3>Always <em>in motion.</em></h3><p>Eleven-plus years of floorball, badminton, and team leadership.</p><span class="chapter-link">On and off the court <b aria-hidden="true">↗</b></span></div><span class="chapter-concept">CONCEPT IMAGE</span></a>
    <a class="chapter-card chapter-editing reveal" href="/editing/"><span class="chapter-number">04 / VIDEO EDITING</span><div class="mini-timeline" aria-hidden="true"><span></span><span></span><span></span><i></i></div><div class="chapter-card-copy"><h3>Cut to the <em>feeling.</em></h3><p>Finding a story in the footage, the rhythm, and the details.</p><span class="chapter-link">Behind the edit <b aria-hidden="true">↗</b></span></div></a>
    <a class="chapter-card chapter-play reveal" href="/interests/"><span class="chapter-number">05 / OFF DUTY</span><span class="play-mark" aria-hidden="true">✳</span><div class="chapter-card-copy"><h3>Room for <em>play.</em></h3><p>LEGO, writing, and following an idea just to see where it goes.</p><span class="chapter-link">The other things I love <b aria-hidden="true">↗</b></span></div></a>
  </div>
</section>`;

function resumeEntry(entry) {
  return `<article class="resume-entry reveal" id="${entry.id}"><div class="resume-period">${escape(entry.period || '')}</div><div class="resume-entry-content"><h3>${escape(entry.title)}</h3><p class="resume-role">${escape(entry.role)}</p>${entry.summary ? `<p class="resume-summary">${escape(entry.summary)}</p>` : ''}${entry.points?.length ? `<ul class="resume-points">${entry.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>` : ''}${entry.recognition?.length ? `<div class="resume-recognition" aria-label="Recognition">${entry.recognition.map(item => `<span>${escape(item)}</span>`).join('')}</div>` : ''}${entry.link ? `<a class="resume-external" href="${entry.link.url}" target="_blank" rel="noopener noreferrer">${entry.link.label}<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>` : ''}</div></article>`;
}

function resumeGroup(id, title, entries, index) {
  return `<section class="resume-group" id="${id}" aria-labelledby="${id}-title"><div class="resume-group-heading"><span class="eyebrow">${index}</span><h2 id="${id}-title">${title}</h2><span class="resume-count">${String(entries.length).padStart(2, '0')}</span></div>${entries.map(resumeEntry).join('')}</section>`;
}

const about = `${pageHero({ path: '/about/', label: 'ABOUT / SAM ZHIHUAN YANG', first: 'Student. Builder.', second: 'Always curious.', lede: profiles.story.lede })}
<section class="about-background section-pad"><p>From Hangzhou to Canada to California, I’ve learned to find my feet in new places. I’m interested in engineering, entrepreneurship, sports, and telling the stories behind the things I build.</p></section>
<div class="resume-sheet section-pad">${resumeGroup('education', 'Education', education, '01')}
<section class="resume-group" id="languages" aria-labelledby="languages-title"><div class="resume-group-heading"><span class="eyebrow">02</span><h2 id="languages-title">Languages</h2></div><dl class="language-list">${languages.map(([name, level]) => `<div><dt>${name}</dt><dd>${level}</dd></div>`).join('')}</dl></section></div>${nextChapter('/work/')}`;

const work = `${pageHero({ path: '/work/', label: 'SELECTED EXPERIENCE', first: 'Work &', second: 'experience.', lede: 'Engineering, product development, competition teams, and student leadership.' })}
<nav class="resume-jump" aria-label="Experience categories"><a href="#projects">Projects <sup>02</sup></a><a href="#engineering">Engineering <sup>03</sup></a><a href="#leadership">Leadership <sup>01</sup></a><a href="#skills">Skills</a></nav>
<div class="resume-sheet section-pad">${experienceGroups.map((group, i) => resumeGroup(group.id, group.title, group.entries, `0${i + 1}`)).join('')}
<section class="resume-group" id="skills" aria-labelledby="skills-title"><div class="resume-group-heading"><span class="eyebrow">04</span><h2 id="skills-title">Skills</h2></div><dl class="resume-skills">${skills.map(([name, detail]) => `<div><dt>${name}</dt><dd>${detail}</dd></div>`).join('')}</dl></section></div>${nextChapter('/sports/')}`;

const sports = `${pageHero({ path: '/sports/', label: 'SPORTS / COMPETITION & TEAMWORK', first: 'On the', second: 'playing field.', lede: '11+ years of floorball, school badminton, and experience leading teams on and off the court.' })}
<div class="resume-sheet section-pad">${resumeGroup('competitive-sports', 'Competitive sports', sportsExperience, '01')}
<section class="resume-group" id="other-sports" aria-labelledby="other-sports-title"><div class="resume-group-heading"><span class="eyebrow">02</span><h2 id="other-sports-title">Also in the mix</h2></div><p class="other-sports">Basketball · Soccer · Golf · Tennis · Rowing · Squash</p></section></div>${nextChapter('/editing/')}`;

const editing = `${pageHero({ path: '/editing/', label: 'VIDEO EDITING / PICTURE + SOUND', first: 'Finding', second: 'the feeling.', lede: profiles.editing.lede, chips: ['Visual storytelling', 'Rhythm & pacing', 'Sound & color'] })}<section class="editing-feature section-pad" aria-labelledby="edit-feature-title">${editArt}<div class="editing-feature-copy reveal"><p class="eyebrow">A DIFFERENT WAY TO BUILD</p><h2 id="edit-feature-title">Every cut<br><em>counts.</em></h2><p>It’s where my technical curiosity meets my creative side — a chance to shape how a story looks, sounds, and feels.</p></div></section>${storySections(profiles.editing.sections)}${nextChapter('/interests/')}`;

const interests = `${pageHero({ path: '/interests/', label: 'OFF DUTY / THE OTHER THINGS I LOVE', first: 'Room', second: 'for play.', lede: 'LEGO, writing, and following an idea just to see where it goes. Some things don’t need a bigger reason.', chips: ['LEGO', 'Writing', 'Curiosity'] })}<div class="play-banner section-pad reveal"><span aria-hidden="true">✳</span><p>Build it.<br>Take it apart.<br><em>Try something else.</em></p></div>${storySections([
  ['LEGO', 'I love LEGO for the possibilities in a handful of pieces. It’s a place to build, take something apart, and try a different idea simply because I’m curious where it might go.'],
  ['Writing and ideas', 'Writing gives me another way to explore the things I care about. Engineering, moving between places, sports, and the people behind a project all leave me with questions worth thinking through.'],
  ['Following curiosity', 'Not everything needs to become a finished project. I like making room for the ideas that begin as play — a different way to build something, a story to tell, or a question I want to follow.']
])}${nextChapter('/about/')}`;

const pages = [
  ['/', 'Always Curious', 'Sam Yang — student, builder, athlete, and creator. Explore my projects, story, sports, video editing, and interests.', home],
  ['/about/', 'About', profiles.story.lede, about],
  ['/work/', 'Work & Experience', 'Sam Yang’s projects, engineering competitions, student leadership, and technical skills.', work],
  ['/sports/', 'Sports', profiles.sports.lede, sports],
  ['/editing/', 'Video Editing', profiles.editing.lede, editing],
  ['/interests/', 'Off Duty', 'LEGO, writing, and the other things Sam Yang loves.', interests]
];
for (const [path, title, description, content] of pages) {
  const directory = resolve(root, 'dist', `.${path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), documentPage({ path, title, description, content }));
}
// Keep existing bookmarks useful without maintaining individual project pages.
const redirects = {
  '/work/legacy-garage/': '/work/#legacy-garage',
  '/work/engineering/': '/work/#engineering',
  '/work/caliguide/': '/work/#caliguide'
};
for (const [path, target] of Object.entries(redirects)) {
  const directory = resolve(root, 'dist', `.${path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><title>Work &amp; Experience — Sam Yang</title><link rel="canonical" href="${target}"><link rel="stylesheet" href="/styles.css"></head><body><main class="section-pad"><h1>Work &amp; experience</h1><p><a href="${target}">Continue to the experience overview ↗</a></p></main></body></html>\n`);
}
console.log(`Built ${pages.length} pages and ${Object.keys(redirects).length} legacy redirects.`);
