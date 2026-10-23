'use strict';

const PORTFOLIO = {
  profile: {
    name: 'Sameer',
    role: 'Software Development Engineer',
    bio: 'Computer Science undergraduate (graduating 2027) focused on backend engineering with Java and Spring Boot. Builds and deploys REST services and object-oriented systems, backed by 600+ solved LeetCode problems. Seeking entry-level SDE roles and software engineering internships.',
    location: 'Kanpur, India',
    photo: 'passport_size_image.jpeg',
    openToRoles: true,
    email: 'md2004sameer01@gmail.com',
    phone: '+91-9793520310',
    resume: 'Sameer_Resume.pdf',
    links: {
      portfolio: 'https://me.orbitbot.in',
      github: 'https://github.com/md2004sameer',
      linkedin: 'https://www.linkedin.com/in/sameerog',
      leetcode: 'https://leetcode.com/u/sameerog/'
    }
  },
  skills: [
    { category: 'Languages', items: ['Java', 'SQL'] },
    { category: 'Data Structures and Algorithms', items: ['Arrays',' Graphs', 'Recursion', 'Greedy Algorithms', 'Dynamic Programming'] },
    { category: 'Core CS', items: ['OOP', 'Operating Systems', 'Computer Networks'] },
    { category: 'Backend', items: ['Spring Boot', 'Spring Data JPA', 'Hibernate', 'REST APIs', 'Multithreading'] },
    { category: 'Databases and Tools', items: ['PostgreSQL', 'MySQL', 'H2', 'Redis', 'Docker', 'AWS', 'Git', 'CI/CD'] },
    { category: 'System Design', items: ['Solid Principles', 'Design Patterns', 'Low-Level Design (LLD)', 'High-Level Design (HLD)', 'Distributed Systems', 'Caching', 'Load Balancing', 'Rate Limiting', ] }
  ],
  experience: [],
  education: [
    {
      institution: 'Dr. A.P.J. Abdul Kalam Technical University',
      degree: 'B.Tech. in Computer Science and Engineering',
      dates: '2023 – 2027',
      location: 'Lucknow',
      bullets: []
    },
    {
      institution: 'Council for the Indian School Certificate Examinations',
      degree: 'Senior Secondary, Class XII',
      dates: '2022 – 2023',
      location: '',
      bullets: []
    },
    {
      institution: 'Council for the Indian School Certificate Examinations',
      degree: 'Secondary, Class X',
      dates: '2020 – 2021',
      location: '',
      bullets: []
    }
  ],
  projects: [
    {
      slug: 'chess',
      name: 'Chess Engine',
      tagline: 'A Java chess engine with a REST API and live browser-based interface.',
      description: [
        'Implements a Java chess engine with object-oriented design, separating piece-specific move generation, board state, rule-chain move validation, and game-status evaluation.',
        'Enforces king safety, castling, en passant, promotion, and draw conditions (stalemate, repetition, fifty-move rule, insufficient material) through composable interfaces and polymorphism.',
        'Verifies correctness with automated tests for legal moves, checkmate, stalemate, and draw scenarios, and documents the architecture and setup in the README.',
        'Plays against an AI opponent powered by minimax with alpha-beta pruning, and exposes game state through a REST API consumed by the live web interface.'
      ],
      stack: ['Java', 'Object-Oriented Design', 'Minimax', 'Alpha-Beta Pruning', 'REST API', 'Automated Testing'],
      live: 'https://chess.orbitbot.in',
      github: 'https://github.com/md2004sameer/Chess',
      status: 'live project'
    },
    {
      slug: 'squareone',
      name: 'SquareOne – Workspace',
      tagline: 'A workspace with a responsive editor and Spring Boot REST APIs.',
      description: [
        'Delivers a full-stack document editor with a responsive HTML, CSS, and JavaScript interface and Spring Boot REST APIs for creating, searching, editing, and deleting documents.',
        'Persists documents with Spring Data JPA using UUID identifiers and creation/update timestamps; debounced autosave batches edits into queued database writes to avoid redundant saves.',
        'Tracks revision history per document, supports restoring earlier versions, and runs on PostgreSQL in production.',
        'Packages the app as a multi-stage Docker image with Docker Compose, a named volume for durable storage, and a container health check, and serves it live on its own subdomain.'
      ],
      stack: ['Java', 'Spring Boot', 'Spring Data JPA', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript', 'Docker', 'Docker Compose'],
      live: 'https://docs.orbitbot.in',
      github: 'https://github.com/md2004sameer/squareone',
      status: 'Live'
    }
  ],
  achievements: [
    'Solved 600+ LeetCode problems and ranked in the platform’s top 10%.'
  ]
};
