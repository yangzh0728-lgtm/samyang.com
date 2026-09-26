export const profiles = {
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
    ], next: 'editing'
  },
  story: {
    eyebrow: '05 / STUDENT · BUILDER · ATHLETE', title: 'Sam Yang', location: 'THE PHOTO WALL / MY PROFILE', position: '13% top', mobileLabel: 'My profile',
    lede: 'I’m a high school student interested in engineering, entrepreneurship, sports, and video editing. I like turning curiosity into something I can build, test, or share.', chips: ['Hangzhou', 'Canada', 'California'],
    sections: [
      ['A few different places', 'I grew up in Hangzhou, studied in Canada, and now attend school in California. Moving between different environments made me curious about how people, systems, and technology connect.'],
      ['Making things happen', 'I enjoy the people side of a project too: bringing a team together, telling the story, and figuring out how an idea can become useful to someone else.'],
      ['Away from the workbench', 'Sports, video editing, LEGO, and writing give me other ways to explore. This is a place to share the different things I’m learning and building.']
    ], next: 'sports'
  },
  editing: {
    eyebrow: '06 / VIDEO EDITING · VISUAL STORYTELLING', title: 'Finding the story in the cut', mobileLabel: 'Video editing',
    lede: 'Video editing is one of my creative passions. I love taking individual moments and shaping them into a story that feels like something.', chips: ['Video editing', 'Storytelling', 'Picture + sound'],
    sections: [
      ['Why I edit', 'An edit can change the way a moment feels. A different cut, a little more space, or the right sound can give the same footage a completely different energy. That is what keeps me curious.'],
      ['The details I love', ['Finding a rhythm between the footage and the sound', 'Choosing what to keep, what to cut, and when to let a moment breathe', 'Using color and pacing to give a story its own mood']],
      ['Another way to build', 'Like engineering, editing is a process of trying something, watching it back, and refining it. I enjoy that mix of technical decisions and creative instinct.']
    ], next: 'garage'
  }
};
