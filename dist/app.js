const profiles = {
  garage: {
    eyebrow: '01 / RESTORATION · ENGINEERING · STORYTELLING', title: 'Legacy Garage 26', location: 'THE CORVAIR / LEGACY GARAGE 26', position: '22% center', mobileLabel: 'The Corvair',
    lede: 'Restoring a 1968 Chevrolet Corvair, and exploring the engineering, history, and people behind it.', chips: ['1968 Chevrolet Corvair', 'Restoration', 'Storytelling'],
    sections: [
      ['The project', 'Legacy Garage 26 brings together classic cars, hands-on engineering, and storytelling. It is a chance to understand how a machine works by spending time with the real thing.'],
      ['More than the car', 'The project connects people across generations and cultures. Restoration progress, interviews, and Corvair history are all part of the story.'],
      ['What I’m exploring', ['Mechanical design and restoration', 'Documenting the process through photos and media', 'Organizing people and building a project identity', 'Turning real parts into CAD and 3D models']]
    ], next: 'engineering'
  },
  engineering: {
    eyebrow: '02 / DESIGN · BUILD · TEST · REPEAT', title: 'The engineering lab', location: 'THE WORKBENCH / ENGINEERING', position: '53% center', mobileLabel: 'Engineering',
    lede: 'A place for the ideas that start with “what if?” and end up as sketches, prototypes, and things I can actually test.', chips: ['Robotics', 'CAD', '3D printing', 'Mechanical design'],
    sections: [
      ['On the workbench', ['Soccer robot and defensive mechanisms', 'Servo lifting systems', 'CAD models and 3D-printed prototypes', 'Corvair 3D modeling', 'Physics experiments']],
      ['How I like to work', 'Start with a problem. Sketch an idea. Build a version. See what happens. The mistakes and adjustments are just as interesting as the result.'],
      ['Connecting the dots', 'I’m interested in where mechanical design, physics, and useful products meet—and how an idea changes when it leaves the screen.']
    ], next: 'caliguide'
  },
  sports: {
    eyebrow: '03 / ATHLETE · TEAMMATE · ALWAYS LEARNING', title: 'Life on the playing field', location: 'SPORTS CORNER / SAM YANG', position: '88% center', mobileLabel: 'Sports',
    lede: 'Floorball has been part of my life for over nine years. Playing center and serving as a team captain have shaped how I think about teamwork and leadership.', chips: ['Floorball', '9+ years', 'Center', 'Team captain'],
    sections: [
      ['A team sport, in every sense', 'Reading the game, communicating under pressure, and helping teammates find their rhythm are parts of floorball I carry into everything else I do.'],
      ['Bringing the game with me', 'Moving to a new school is also a chance to introduce people to floorball and help build a community around it.'],
      ['Beyond floorball', 'Basketball · Soccer · Badminton · Golf · Tennis · Rowing · Squash'],
      ['What stays with me', 'Discipline, adapting under pressure, learning from a loss, and showing up for a team. There is always another practice and something to improve.']
    ], next: 'story'
  },
  caliguide: {
    eyebrow: '04 / A PRODUCT FOR PEOPLE STARTING SOMEWHERE NEW', title: 'Finding your way with CaliGuide', location: 'ON THE SCREEN / CALIGUIDE', position: '78% center', mobileLabel: 'CaliGuide',
    lede: 'A website designed to help newcomers navigate everyday life in California, inspired by the experience of finding my own way in a new place.', chips: ['Web development', 'Product design', 'Entrepreneurship'],
    sections: [
      ['The idea', 'Moving is exciting. Figuring out unfamiliar systems can be overwhelming. CaliGuide brings practical information together so people have a clearer place to start.'],
      ['Everyday questions', ['DMV and transportation', 'Banking and housing', 'Education and healthcare']],
      ['What I’m learning', 'How to organize information around real questions, make a website easier to use, and turn a personal experience into something useful for other people.']
    ], next: 'garage'
  },
  story: {
    eyebrow: '05 / STUDENT · BUILDER · ATHLETE', title: 'Sam Yang', location: 'THE PHOTO WALL / MY PROFILE', position: '13% top', mobileLabel: 'My profile',
    lede: 'I’m a high school student interested in engineering, entrepreneurship, sports, and storytelling. I like turning curiosity into something I can build, test, or share.', chips: ['Hangzhou', 'Canada', 'California'],
    sections: [
      ['A few different places', 'I grew up in Hangzhou, studied in Canada, and now attend school in California. Moving between different environments made me curious about how people, systems, and technology connect.'],
      ['Making things happen', 'I enjoy the people side of a project too: bringing a team together, telling the story, and figuring out how an idea can become useful to someone else.'],
      ['Away from the workbench', 'Sports, community, and writing give me other ways to explore. This is a place to share the different things I’m learning and building.']
    ], next: 'sports'
  }
};

const dialog = document.querySelector('#profile-dialog');
const content = document.querySelector('#dialog-content');
const closeButton = document.querySelector('.dialog-close');
const motionButton = document.querySelector('.motion-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let returnFocus = null;
let previousHash = '';
let motionPaused = reduceMotion.matches;

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function openProfile(key, trigger, updateHash = true) {
  const profile = profiles[key];
  if (!profile) return;
  if (!dialog.open) {
    returnFocus = trigger ?? document.activeElement;
    previousHash = location.hash.startsWith('#profile/') ? '#work' : location.hash;
  }
  content.replaceChildren();
  const eyebrow = textElement('p', 'eyebrow', profile.eyebrow);
  const heading = textElement('h2', '', profile.title);
  heading.id = 'profile-title';
  content.append(eyebrow, heading, textElement('p', 'dialog-lede', profile.lede));
  const chips = document.createElement('div');
  chips.className = 'profile-chips';
  profile.chips.forEach(chip => chips.append(textElement('span', '', chip)));
  content.append(chips);
  for (const [title, body] of profile.sections) {
    const section = document.createElement('section');
    section.className = 'profile-section';
    section.append(textElement('h3', '', title));
    if (Array.isArray(body)) {
      const list = document.createElement('ul');
      body.forEach(item => list.append(textElement('li', '', item)));
      section.append(list);
    } else section.append(textElement('p', '', body));
    content.append(section);
  }
  const footer = document.createElement('div');
  footer.className = 'profile-footer';
  const next = textElement('button', '', `Next: ${profiles[profile.next].mobileLabel} ↗`);
  next.dataset.profile = profile.next;
  footer.append(textElement('span', '', 'SAM YANG / ALWAYS CURIOUS'), next);
  content.append(footer);
  
  
  document.body.classList.add('dialog-open');
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  closeButton.focus({ preventScroll: true });
  if (updateHash) history.replaceState(null, '', `#profile/${key}`);
}

function closeProfile() {
  if (dialog.open) dialog.close();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-profile]');
  if (trigger) openProfile(trigger.dataset.profile, trigger);
});
closeButton.addEventListener('click', closeProfile);
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProfile();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (location.hash.startsWith('#profile/')) history.replaceState(null, '', `${location.pathname}${location.search}${previousHash}`);
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});

function syncHash() {
  const key = location.hash.startsWith('#profile/') ? location.hash.slice(9) : null;
  if (key && profiles[key]) openProfile(key, null, false);
  else if (dialog.open) closeProfile();
}
window.addEventListener('hashchange', syncHash);
syncHash();

function updateMotion(paused) {
  motionPaused = paused;
  document.body.classList.toggle('motion-paused', paused);
  document.body.classList.toggle('motion-enabled', !paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
  motionButton.title = paused ? 'Enable animations' : 'Pause animations';
  motionButton.querySelector('.motion-label').textContent = paused ? 'Motion off' : 'Motion on';
  motionButton.querySelector('.motion-symbol').textContent = paused ? '▷' : 'Ⅱ';
  if (paused) {
    document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
    
  }
}
updateMotion(motionPaused);
motionButton.addEventListener('click', () => updateMotion(!motionPaused));
reduceMotion.addEventListener('change', event => updateMotion(event.matches));


document.querySelector('#year').textContent = new Date().getFullYear();
const reveals = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); observer.unobserve(entry.target); }
    });
  }, { threshold: .06 });
  reveals.forEach(element => {
    if (!motionPaused && element.getBoundingClientRect().top > innerHeight) element.classList.add('reveal-pending');
    observer.observe(element);
  });
  const navigation = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('nav a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -45% 0px' });
  document.querySelectorAll('.hero, main > section[id]').forEach(section => navigation.observe(section));
}
