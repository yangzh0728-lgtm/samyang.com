// Professional and education details transcribed from Sam's supplied résumé screenshot.
// Contact details and the source document are intentionally not bundled with the site.
export const experienceGroups = [
  {
    id: 'projects', title: 'Projects & entrepreneurship',
    entries: [
      { id: 'legacy-garage', title: 'Legacy Garage 26', role: 'Founder / Project Lead', period: '2025–Present',
        summary: 'Founded a student-led engineering and media project restoring a 1968 Chevrolet Corvair.',
        points: ['Work with an experienced mechanic to study automotive systems and restoration.', 'Lead a student team across engineering research, media, partnerships, and educational content.'],
        link: { url: 'https://www.instagram.com/legacy_garage26/', label: 'Legacy Garage on Instagram' } },
      { id: 'caliguide', title: 'CaliGuide', role: 'Founder / Developer', period: '2025–Present',
        summary: 'Developing a free information platform to help newcomers navigate everyday life in California.',
        points: ['Designed the information structure and user experience around practical questions, from driver’s licenses to banking.', 'Deployed and managed the site with AWS EC2, Ubuntu, Caddy, GitHub, and Route 53.'],
        link: { url: 'https://www.caliguide.org/', label: 'Visit CaliGuide' } },
      { id: 'webb-technology-seminar', title: 'Webb Technology & Seminar', role: 'Student · Course portfolio',
        summary: 'Documenting hands-on projects and reflections from my Technology & Seminar course at The Webb Schools.',
        points: ['Includes an Arduino parking sensor built with an ultrasonic sensor, LEDs, and feedback from classmates, documented in an innovator journal.'],
        link: { url: 'https://yangzh0728-lgtm.github.io/webbts/?v=f475e88a533fe01505f9c991b76426eeec24f5ba', label: 'Explore my course portfolio' } }
    ]
  },
  {
    id: 'engineering', title: 'Engineering & innovation',
    entries: [
      { id: 'fiberscope', title: 'FiberScope-X / AxonGuard', role: 'Engineering Innovation Competitions · Team Captain', period: 'Grades 9–11',
        summary: 'Led a multidisciplinary team building a fiber-optic health-monitoring prototype for early risk detection in AI data centers.',
        points: ['Coordinated a custom PCB, sensor-data acquisition, and a monitoring dashboard; tested signal loss with an optical attenuator.', 'Directed product positioning, market analysis, business-model development, and competition pitches.'],
        recognition: ['Conrad Challenge Global Top 10 / Global Finalist Alternate', 'Blue Ocean Competition Top 500'],
        links: [
          { url: 'https://fiber-scope-x.vercel.app/', label: 'Visit FiberScope-X' },
          { url: 'https://github.com/yangzh0728-lgtm/FiberScope-X', label: 'View on GitHub' }
        ] },
      { id: 'novatex', title: 'NovaTex SE / EcoWeave', role: 'Engineering Innovation Competitions · Team Captain', period: 'Grades 9–11',
        summary: 'Led team coordination, project planning, and competition preparation for a sustainability-focused innovation project.',
        points: ['Guided the team’s submission and presentation.'], recognition: ['Conrad Innovator recognition'] },
      { id: 'robotics', title: 'Robotics Team', role: 'Mechanical Engineer', period: 'Grade 8–Present',
        summary: 'Competed in VEX IQ and FTC as part of school robotics teams.',
        points: ['Designed and prototyped mechanical components using CAD and 3D-printing concepts.'] }
    ]
  },
  {
    id: 'leadership', title: 'Student leadership',
    entries: [
      { id: 'student-leadership', title: 'Student Leadership', role: 'Dorm Prefect', period: '', summary: 'Served as a dorm prefect.' }
    ]
  }
];

export const education = [
  { id: 'webb', title: 'The Webb Schools', role: 'High School · Claremont, CA', period: 'Class of 2028', website: 'https://www.webb.org/' },
  { id: 'trinity', title: 'Trinity College School', role: 'Grade 9 · Port Hope, Ontario, Canada', period: '2025–2026 school year', website: 'https://www.tcs.on.ca/' },
  { id: 'middle-school', title: 'Middle School', role: 'Toronto, Canada', period: '' },
  { id: 'elementary-school', title: 'Elementary School', role: 'Hangzhou, China', period: '' }
];

export const sportsExperience = [
  { id: 'floorball', title: 'Floorball', role: 'Player & Team Leader', period: '11+ years',
    summary: 'Former team captain and starting center, with experience in regional and national youth tournaments.',
    points: ['1st Place — Oriental Cup Final (2024).', '2nd Place — National Youth U Series (2024).'] },
  { id: 'badminton', title: 'Badminton', role: 'Player & Team Captain', period: 'Grade 9–Present',
    summary: 'Team captain, developing leadership, communication, and competitive decision-making.',
    points: ['CISAA 2nd place in men’s doubles.', 'School team MVP (Grade 9).'] }
];

export const skills = [
  ['Engineering', 'CAD, mechanical prototyping, basic robotics, experimental design'],
  ['Physics', 'Mechanics, forces, energy, motion, friction, springs, data analysis'],
  ['Technology', 'GitHub, AWS EC2, Ubuntu, Caddy, Route 53, basic web development'],
  ['Project skills', 'Research, project management, team leadership, outreach, interviewing']
];
