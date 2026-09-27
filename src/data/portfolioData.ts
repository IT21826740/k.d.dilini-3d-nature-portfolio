export interface Project {
  id: string;
  title: string;
  category: string;
  badge: string;
  tagline: string;
  element: 'geo' | 'anemo' | 'electro' | 'dendro' | 'hydro' | 'pyro' | 'cryo';
  rarity: 4 | 5;
  size: 'feature' | 'wide' | 'normal';
  paragraphs: string[];
  features: string[];
  contribution: string[];
  architecture: string[];
  tags: string[];
  links: { label: string; url: string }[];
  note?: string;
  questRank?: string;
}

export interface SkillItem {
  name: string;
  slug: string;
  level: number; // 1 - 100
  element: 'geo' | 'anemo' | 'electro' | 'dendro' | 'hydro' | 'pyro';
}

export interface SkillCategory {
  label: string;
  description: string;
  items: SkillItem[];
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  url: string;
  date?: string;
  rarity: 4 | 5;
  slot: string; // Genshin artifact slots: 'Flower of Life' | 'Plume of Death' | 'Sands of Eon' | 'Goblet of Eonothem' | 'Circlet of Logos'
}

export const DILINI_PROFILE = {
  name: 'K.D. Dilini',
  fullName: 'K.D. Dilini',
  title: 'Full Stack Java & Spring Boot Developer',
  vision: 'Geo / Anemo Dual Resonance',
  constellation: 'Architectura Systematis',
  affiliation: 'SLIIT Graduate · BSc (Hons) in Information Technology',
  location: 'Sri Lanka',
  phone: '+94 75 314 0177',
  email: 'dchathurya3@gmail.com',
  githubUsername: 'IT21826740',
  githubUrl: 'https://github.com/IT21826740',
  summary:
    'Java and Spring Boot focused full-stack developer with 14+ shipped projects spanning secure enterprise APIs, IoT edge AI, distributed messaging, mobile applications, and augmented reality.',
  stats: [
    { label: 'Archon Quests (Projects)', value: '14+' },
    { label: 'Domains Explored (Tech)', value: '30+' },
    { label: 'Relational & NoSQL Vaults', value: '4' },
    { label: 'Level of Mastery (SLIIT)', value: 'BSc (Hons)' },
  ],
  radarAttributes: [
    { label: 'Java/Spring', value: 95 },
    { label: 'System Design', value: 88 },
    { label: 'DB & SQL', value: 90 },
    { label: 'Testing & QA', value: 86 },
    { label: 'Frontend / UI', value: 82 },
    { label: 'IoT / Edge AI', value: 65 },
  ]
};

export const ELEMENT_THEMES = {
  all: {
    name: 'Omni Resonance',
    color: '#d4af37',
    glow: 'rgba(212, 175, 55, 0.4)',
    bg: 'from-amber-900/30 to-slate-900/80',
    description: 'All elemental disciplines aligned',
    icon: '✦'
  },
  geo: {
    name: 'Geo (Foundation & Backend)',
    color: '#e6b85c',
    glow: 'rgba(230, 184, 92, 0.4)',
    bg: 'from-yellow-950/40 to-slate-950/80',
    description: 'Immovable backend architectures, Spring Boot, MySQL & Docker containers',
    icon: '⬟'
  },
  electro: {
    name: 'Electro (Asynchronous & Messaging)',
    color: '#ba7ff7',
    glow: 'rgba(186, 127, 247, 0.4)',
    bg: 'from-purple-950/40 to-slate-950/80',
    description: 'High-speed messaging streams, RabbitMQ, Spring AMQP & TCP Sockets',
    icon: '⚡'
  },
  anemo: {
    name: 'Anemo (Modern Web & Fluid UI)',
    color: '#56e2c6',
    glow: 'rgba(86, 226, 198, 0.4)',
    bg: 'from-teal-950/40 to-slate-950/80',
    description: 'Swift and responsive user experiences, React, Next.js & Tailwind CSS',
    icon: '🍃'
  },
  dendro: {
    name: 'Dendro (IoT & Edge Intelligence)',
    color: '#7bdc4e',
    glow: 'rgba(123, 220, 78, 0.4)',
    bg: 'from-emerald-950/40 to-slate-950/80',
    description: 'Smart environmental sensors, TinyML, MobileNetV2 & MQTT communication',
    icon: '🌿'
  },
  hydro: {
    name: 'Hydro (Enterprise & Data Flow)',
    color: '#46b1f8',
    glow: 'rgba(70, 177, 248, 0.4)',
    bg: 'from-sky-950/40 to-slate-950/80',
    description: 'Seamless institute and packaging workflows, CRUD APIs & payments',
    icon: '💧'
  },
  pyro: {
    name: 'Pyro (Creative Ventures & AR)',
    color: '#f36b48',
    glow: 'rgba(243, 107, 72, 0.4)',
    bg: 'from-orange-950/40 to-slate-950/80',
    description: 'Passionate experiments, Unity 3D Vuforia AR & multimedia creations',
    icon: '🔥'
  },
  cryo: {
    name: 'Cryo (Precision & Optimization)',
    color: '#9be8fb',
    glow: 'rgba(155, 232, 251, 0.4)',
    bg: 'from-cyan-950/40 to-slate-950/80',
    description: 'Crisp analytical rigor, performance tuning & systems logic',
    icon: '❄'
  }
};

export const PROJECTS: Project[] = [
  {
    id: 'smart-glasses',
    title: 'AI-Powered Smart Glasses',
    category: 'IoT · TinyML · Edge AI',
    badge: 'Featured Research Project',
    tagline: 'Offline document recognition and voice feedback for visually impaired users.',
    element: 'dendro',
    rarity: 5,
    size: 'feature',
    questRank: 'Archon Quest Chapter IV',
    paragraphs: [
      'An offline edge-AI assistive system using Raspberry Pi 5, camera input, document classification, Sinhala and English OCR, and synthesized voice feedback without relying on cloud servers.'
    ],
    features: [
      '100% offline edge processing on Raspberry Pi 5',
      'Sinhala & English bilingual OCR powered by Tesseract 5.5.0',
      'MobileNetV2 document classifier custom-trained across 6 document types',
      'Real-time voice-guided capture assistance',
      'Android companion application with Bluetooth LE telemetry and controls'
    ],
    contribution: [
      'Benchmark-evaluated multiple OCR and text-detection models before engineering Tesseract pipeline',
      'Built the low-latency local Flask inference pipeline on Raspberry Pi 5 hardware',
      'Trained and quantized the MobileNetV2 document classification neural network',
      'Developed native Android communication, foreground services, runtime permissions, and audio pipeline'
    ],
    architecture: ['Camera Sensor', 'Raspberry Pi 5', 'MobileNetV2 Classifier', 'Tesseract OCR', 'Text NLP Engine', 'Audio / TTS Voice Feedback'],
    tags: ['Python', 'TensorFlow Lite', 'MobileNetV2', 'Tesseract OCR', 'Raspberry Pi 5', 'Flask', 'Android', 'Bluetooth LE', 'OpenCV', 'TinyML'],
    links: [
      { label: 'GitHub Repository', url: 'https://github.com/IT21826740/research_project_2025' },
      { label: 'Live Showcase Site', url: 'https://researchproject2025.vercel.app' }
    ]
  },
  {
    id: 'english-institute-ms',
    title: 'Italian English Institute Management System',
    category: 'Enterprise · Java Backend',
    badge: 'Internship Project · 4-Person Lead',
    tagline: 'A robust Spring Boot management platform developed during Java backend internship.',
    element: 'geo',
    rarity: 5,
    size: 'wide',
    questRank: 'Enterprise Commission Rank S',
    paragraphs: [
      'A multi-tier institutional platform managing teachers, staff, student guardians, biometric attendance, partial payment plans, sibling discounts, referral bonuses, and marketing promotions.'
    ],
    features: [
      'Staff and guardian role-based management (RBAC)',
      'Automated student attendance tracking and session logging',
      'Partial installment payment processing and receipt generation',
      'Flexible tier-based discount plans & referral incentives',
      'Secure token authorization with JWT & Spring Security',
      'Flyway database migrations for zero-downtime schema evolution'
    ],
    contribution: [
      'Engineered Spring Boot REST APIs across Controller, Service, and Repository architectural layers',
      'Designed complex MySQL entity relationships, database constraints, and validation schemas',
      'Implemented stateless JWT authentication filters and security context authorization',
      'Wrote comprehensive unit and integration suites using JUnit 5, Mockito, and Spring Boot Test',
      'Integrated JaCoCo code coverage analysis and SonarQube static code quality gates',
      'Contributed to the multi-page Figma design system covering 33+ comprehensive UI screens'
    ],
    architecture: ['Jira Requirements', 'ER Schema Design', 'Spring Boot REST API', 'Spring Security + JWT', 'Automated JUnit / Mockito', 'SonarQube & JaCoCo', 'Docker Deployment'],
    tags: ['Java 17', 'Spring Boot', 'Spring Security', 'JWT', 'MySQL', 'Flyway', 'Docker', 'Swagger / OpenAPI', 'JUnit', 'Mockito', 'SonarQube'],
    links: [],
    note: 'Private company codebase (ZeroCode Software Ltd) — production enterprise software.'
  },
  {
    id: 'quick-task-manager',
    title: 'Quick Task Manager',
    category: 'Full-Stack Web Application',
    badge: 'Java + React Masterwork',
    tagline: 'A modern task management platform built around clean REST APIs and test coverage.',
    element: 'anemo',
    rarity: 5,
    size: 'normal',
    questRank: 'Commission Chapter II',
    paragraphs: [
      'A full-stack task planning and tracking application for creating, prioritizing, categorizing, and monitoring deliverables with interactive real-time productivity analytics.'
    ],
    features: [
      'Secure JWT authentication and user session control',
      'Task lifecycle status and priority matrix management',
      'Dynamic multi-filter search and dashboard metrics visualization',
      'RESTful backend architecture with global exception handling',
      'Fluid React user interface with responsive layout'
    ],
    contribution: [
      'Engineered Spring Boot REST APIs, transactional services, and repository layers',
      'Structured database relational entities and cascading relationships',
      'Integrated React frontend state management with backend endpoints',
      'Authored automated test coverage using JUnit 5 and Mockito',
      'Configured Docker compose containers for instant development bootstrapping'
    ],
    architecture: ['React UI', 'RESTful Endpoints', 'Spring Security', 'Service Layer', 'Spring Data JPA', 'MySQL Vault', 'Docker'],
    tags: ['Java', 'Spring Boot', 'React', 'MySQL', 'Spring Security', 'JWT', 'JUnit', 'Mockito', 'JaCoCo', 'SonarQube', 'Docker'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/quick-task-manager.git' }]
  },
  {
    id: 'rabbitmq-producer',
    title: 'Spring Boot RabbitMQ Producer',
    category: 'Backend · Messaging',
    badge: 'Java 17+ · Spring AMQP',
    tagline: 'High-throughput event publisher streaming messages into RabbitMQ queues.',
    element: 'electro',
    rarity: 4,
    size: 'normal',
    questRank: 'Domain of Asynchronous Thunder',
    paragraphs: [
      'A focused distributed messaging service demonstrating how enterprise Spring Boot applications publish structured payloads to RabbitMQ exchanges via Spring AMQP for decoupled microservice communication.'
    ],
    features: [
      'REST endpoint triggers for publishing async messages',
      'Configured direct and topic exchange routing topologies',
      'Spring AMQP template integration with automatic retries',
      'Containerized RabbitMQ development setup via Docker'
    ],
    contribution: [
      'Constructed the publisher message pipeline and event dispatchers',
      'Configured AMQP properties, exchange keys, and message serializers',
      'Exposed message endpoints with validated payloads'
    ],
    architecture: ['REST Client', 'Spring Boot Producer', 'RabbitTemplate', 'Direct / Topic Exchange', 'RabbitMQ Queue'],
    tags: ['Java', 'Spring Boot', 'Spring AMQP', 'RabbitMQ', 'Maven', 'Docker', 'Microservices'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/spring-boot-rabbitmq-producer' }]
  },
  {
    id: 'rabbitmq-consumer',
    title: 'Spring Boot RabbitMQ Consumer',
    category: 'Backend · Messaging',
    badge: 'Java 17+ · Spring AMQP',
    tagline: 'Asynchronous event consumer processing distributed message queues.',
    element: 'electro',
    rarity: 4,
    size: 'normal',
    questRank: 'Domain of Asynchronous Thunder',
    paragraphs: [
      'The consumer counterpart to the RabbitMQ messaging system. Continuously listens to subscribed message queues, deserializes payloads, and executes asynchronous background processing.'
    ],
    features: [
      'Resilient RabbitMQ queue listener with dead-letter fallback',
      'Non-blocking asynchronous message ingestion',
      'Declarative queue binding and connection pooling',
      'Containerized deployment via Docker'
    ],
    contribution: [
      'Implemented @RabbitListener message handlers and concurrency settings',
      'Connected authentication, credential handling, and error policies',
      'Validated end-to-end event delivery between producer and consumer'
    ],
    architecture: ['RabbitMQ Queue', 'AMQP Listener Container', 'Spring Boot Consumer', 'Payload Service Processing'],
    tags: ['Java', 'Spring Boot', 'Spring AMQP', 'RabbitMQ', 'Maven', 'Docker'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/spring-boot-rabbitmq-consumer' }]
  },
  {
    id: 'auralink-iot',
    title: 'AuraLink AI-IoT Ecosystem',
    category: 'IoT · AI · MQTT',
    badge: 'ESP32 + Python + Groq Llama',
    tagline: 'An AI-integrated IoT ecosystem connecting environmental sensors with LLM intelligence.',
    element: 'dendro',
    rarity: 5,
    size: 'feature',
    questRank: 'Archon Quest Chapter V',
    paragraphs: [
      'AuraLink bridges physical ESP32 microcontrollers and environmental gas/climate sensors to a Python backend over MQTT. An LLM agent synthesizes real-time contextual updates while a Gmail OAuth2 service flags urgent correspondence.'
    ],
    features: [
      'ESP32 with DHT22 temperature/humidity and MQ135 air quality telemetry',
      'Hardware OLED display with smooth scrolling notifications',
      'Two-way MQTT pub/sub protocol between edge node and server',
      'Groq Llama 3.3 integration for contextual real-time generative insights',
      'Gmail API integration with OAuth2 for summarizing unread urgent messages',
      'Interactive Textual TUI terminal monitoring dashboard',
      'Mock ESP32 hardware simulator for offline testing'
    ],
    contribution: [
      'Programmed ESP32 firmware in C++ / Arduino with MQTT client loops',
      'Built the Python backend integration with LangChain-Groq and Paho MQTT',
      'Integrated Google OAuth2 authentication flow for Gmail intelligence',
      'Constructed hardware emulation scripts for continuous testing'
    ],
    architecture: ['ESP32 Sensors', 'MQTT Broker (Paho)', 'Python Backend Server', 'Groq Llama 3.3 LLM', 'Gmail API', 'OLED & Hardware Alerts'],
    tags: ['ESP32', 'Arduino C++', 'Python 3.11', 'MQTT', 'Paho MQTT', 'Textual TUI', 'Groq Llama 3.3', 'LangChain', 'Gmail API', 'OAuth2'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/AuraLink' }]
  },
  {
    id: 'simple-chat',
    title: 'Multi-Client TCP Chat Server',
    category: 'Systems Programming · C',
    badge: 'TCP Sockets · Linux IPC',
    tagline: 'A multi-client terminal chat architecture built on raw TCP sockets and process forks.',
    element: 'electro',
    rarity: 4,
    size: 'normal',
    questRank: 'Systems Citadel Trial',
    paragraphs: [
      'A low-level client-server socket application demonstrating POSIX socket programming, process-based concurrency via fork(), and inter-process communication on Linux distributions.'
    ],
    features: [
      'Clean POSIX TCP socket client-server networking',
      'Process-level concurrency using fork() for simultaneous connections',
      'Client authentication and credential validation',
      'Server-mediated message broadcast relaying',
      'Graceful connection termination and resource reclamation'
    ],
    contribution: [
      'Engineered C client and server socket listeners from scratch',
      'Managed network byte ordering, buffer parsing, and process lifecycle',
      'Configured cross-distro compilation on CentOS and Fedora'
    ],
    architecture: ['Client Process', 'POSIX TCP Socket', 'CentOS Master Server', 'fork() Child Workers', 'Message Relay Loop'],
    tags: ['C', 'TCP Sockets', 'POSIX', 'Linux', 'CentOS', 'Fedora', 'IPC', 'fork()', 'Networking'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/Simple-Chat-Application' }]
  },
  {
    id: 'wheelvault-android',
    title: 'WheelVault Bike Companion',
    category: 'Android · Kotlin',
    badge: 'Kotlin · Architecture Components · Room',
    tagline: 'A cycling companion app for cataloguing bike components and servicing records.',
    element: 'anemo',
    rarity: 4,
    size: 'normal',
    questRank: 'Mobile Journey Chronicle',
    paragraphs: [
      'A native Android application designed for cycling enthusiasts to inventory bike components, track maintenance logs, monitor replacement cycles, and manage repair histories.'
    ],
    features: [
      'Detailed bike part catalogue with specifications and pricing',
      'Maintenance schedule tracker with record logging',
      'Local persistence with Android Room database and SQLite',
      'Modern MVVM-oriented UI with Fragments and RecyclerView'
    ],
    contribution: [
      'Designed native Kotlin activities, fragments, and navigation workflows',
      'Implemented Room Database schemas, DAOs, and repository patterns',
      'Built custom RecyclerView adapters with interactive card view holders'
    ],
    architecture: ['Android UI', 'Navigation Component', 'ViewModel / Repository', 'Room Database', 'SQLite Engine'],
    tags: ['Kotlin', 'Android', 'Fragments', 'Room Database', 'SQLite', 'RecyclerView', 'MVVM'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/wheelVault' }]
  },
  {
    id: 'cherry-bay-cafe',
    title: 'Cherry Bay Café Ordering Platform',
    category: 'Restaurant Commerce',
    badge: 'Spring Boot + Next.js',
    tagline: 'A modern café ordering platform powered by a live Spring Boot backend.',
    element: 'hydro',
    rarity: 4,
    size: 'normal',
    questRank: 'Culinary Realm Commission',
    paragraphs: [
      'An end-to-end commerce ordering solution combining a Spring Boot REST API service with a responsive Next.js frontend, managing menus, customer orders, loyalty points, and admin operations.'
    ],
    features: [
      'Dynamic menu browsing and custom item configurations',
      'Cart management with real-time total computation',
      'Administrative dashboard for inventory and order dispatching',
      'MySQL relational persistence with transactional integrity'
    ],
    contribution: [
      'Developed Spring Boot REST controllers, services, and DTO contracts',
      'Integrated Next.js frontend views to consume live REST endpoints',
      'Implemented order status state machines and database queries'
    ],
    architecture: ['Next.js Client', 'Spring Boot Service', 'Spring Data JPA', 'MySQL Database'],
    tags: ['Java', 'Spring Boot', 'Next.js', 'React', 'MySQL', 'REST API'],
    links: []
  },
  {
    id: 'fitness-app',
    title: 'Fitness Tracking Ecosystem',
    category: 'Mobile + Backend',
    badge: 'Spring Boot · OAuth2 · Android',
    tagline: 'A fitness application integrating Spring Boot APIs with native Android features.',
    element: 'hydro',
    rarity: 4,
    size: 'normal',
    questRank: 'Vitality Domain Trial',
    paragraphs: [
      'A fitness tracking platform linking a Spring Boot authorization and data backend with an Android mobile client, featuring OAuth2 user authentication and workout telemetry.'
    ],
    features: [
      'OAuth2 authentication protocol and secure token management',
      'Spring Boot backend services for workout planning and tracking',
      'Native Android extension for on-the-go data logging',
      'Device connectivity and telemetry synchronization'
    ],
    contribution: [
      'Configured OAuth2 authorization server and token validation filters',
      'Created backend REST APIs for workout logs and profile statistics',
      'Connected Android client with backend HTTP services'
    ],
    architecture: ['Android Client', 'OAuth2 Security Filter', 'Spring Boot Backend', 'MySQL Database'],
    tags: ['Java', 'Spring Boot', 'OAuth2', 'Android', 'Bluetooth', 'REST API'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/Fitness-App.git' }]
  },
  {
    id: 'packaging-labeling-ms',
    title: 'Packaging & Labeling Management System',
    category: 'Full-Stack MERN Platform',
    badge: 'Team Innovation Project',
    tagline: 'Inventory, labeling, and order fulfillment platform for packaging logistics.',
    element: 'hydro',
    rarity: 4,
    size: 'normal',
    questRank: 'Industrial Guild Assignment',
    paragraphs: [
      'An enterprise operations system supporting packaging material inventory, automated label generation with QR codes, delivery tracking, stock threshold alerts, and management reporting.'
    ],
    features: [
      'Complete CRUD workflows for warehouse inventory and materials',
      'Automated product labeling with QR code identification',
      'Order fulfillment lifecycle tracking and delivery status',
      'Low-stock automated alerts and tabular Excel report exports'
    ],
    contribution: [
      'Implemented full-stack CRUD modules across Node.js/Express and React',
      'Designed MongoDB document collections and indexing strategies',
      'Built tabular data export pipelines and operational search filters'
    ],
    architecture: ['React SPA', 'Express.js Router', 'Node.js Runtime', 'MongoDB Atlas'],
    tags: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'REST API'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/Packaging-and-Labeling-Management-System-MERN-project' }]
  },
  {
    id: 'travel-tour-ms',
    title: 'Travel & Tour Management Platform',
    category: 'Full-Stack Tourism Platform',
    badge: '8-Person University Lead',
    tagline: 'A collaborative travel platform engineered from Figma design prototypes.',
    element: 'anemo',
    rarity: 4,
    size: 'normal',
    questRank: 'Expedition Registry Chapter',
    paragraphs: [
      'A travel booking and exploration portal engineered by an 8-member university team, translating high-fidelity Figma design systems into responsive React modules with MongoDB data pipelines.'
    ],
    features: [
      'Curated destination showcase and tour itinerary catalog',
      'Booking workflow with date selection and customer validation',
      'User authentication, session tokens, and booking histories',
      'Responsive design adapting across desktop and mobile screens'
    ],
    contribution: [
      'Coordinated the 8-member team workflow and Git branch merging',
      'Transformed Figma design specifications into modular React components',
      'Integrated MongoDB database schemas for tours, bookings, and user profiles'
    ],
    architecture: ['React Frontend', 'Express.js Service Layer', 'MongoDB Database', 'Figma Design System'],
    tags: ['MongoDB', 'Express', 'React', 'Node.js', 'Figma', 'Team Leadership'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/ITPM_REG_WE_08_SLIIT_2024.git' }]
  },
  {
    id: 'timescape-ar',
    title: 'TimeScape Augmented Reality',
    category: 'Augmented Reality · 3D',
    badge: 'Unity 3D · Vuforia Engine',
    tagline: 'An interactive AR experience exploring temporal and historical spatial visualizations.',
    element: 'pyro',
    rarity: 4,
    size: 'normal',
    questRank: 'Dimensional Rift Exploration',
    paragraphs: [
      'An augmented reality spatial project crafted in Unity with the Vuforia AR SDK, projecting historical 3D models and chronological architectural evolutions onto image target anchors.'
    ],
    features: [
      'Real-time image target marker tracking and 6-DoF pose estimation',
      'Interactive 3D model manipulation and temporal time-slider scrubbing',
      'Smooth shader lighting and spatial visual feedback'
    ],
    contribution: [
      'Assembled Unity 3D scene hierarchies, lighting rigs, and camera projections',
      'Programmed C# interaction scripts for model inspection and scaling',
      'Configured Vuforia image target databases and tracking parameters'
    ],
    architecture: ['Camera Feed', 'Vuforia Image Tracker', 'Unity 3D Engine', 'C# Behavioral Scripts', 'Rendered Spatial Viewport'],
    tags: ['Unity', 'Vuforia', 'C#', '3D Graphics', 'Augmented Reality', 'Shader'],
    links: [{ label: 'GitHub Repository', url: 'https://github.com/IT21826740/TimeScape-AR' }]
  },
  {
    id: 'java-learning-lab',
    title: 'Java & Spring Boot Engineering Lab',
    category: 'Continuous Innovation',
    badge: 'Personal Engineering Space',
    tagline: 'An active laboratory refining enterprise Java patterns, testing, and cloud technologies.',
    element: 'geo',
    rarity: 4,
    size: 'wide',
    questRank: 'Celestia Knowledge Spire',
    paragraphs: [
      'An ongoing research and practice repository dedicated to mastering advanced Spring Boot architecture, distributed caching, security hardening, database optimizations, and containerized deployments.'
    ],
    features: [
      'Hands-on Spring Boot 3+ feature prototyping and benchmark suites',
      'Security configurations exploring OAuth2, JWT, and method security',
      'Automated testing practices with JUnit 5, Mockito, and Testcontainers',
      'Containerization patterns with multi-stage Docker builds'
    ],
    contribution: [
      'Continuously write clean, documented backend modules for ongoing learning',
      'Test performance differences between database query strategies',
      'Benchmark API response times and asynchronous pipelines'
    ],
    architecture: ['Java 21 / 17', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL / MySQL', 'Docker Engine'],
    tags: ['Java', 'Spring Boot', 'REST APIs', 'Spring Security', 'Docker', 'JUnit', 'SQL'],
    links: []
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: 'Core Languages',
    description: 'Foundational programming languages utilized in production and academic projects',
    items: [
      { name: 'Java', slug: 'java', level: 96, element: 'geo' },
      { name: 'JavaScript', slug: 'js', level: 80, element: 'anemo' },
      { name: 'Kotlin', slug: 'kotlin', level: 46, element: 'anemo' },
      { name: 'Python', slug: 'python', level: 68, element: 'dendro' },
      { name: 'C', slug: 'c', level: 32, element: 'electro' },
      { name: 'C++', slug: 'cpp', level: 34, element: 'electro' }
    ]
  },
  {
    label: 'Backend & APIs',
    description: 'Server-side frameworks, security pipelines, and distributed messaging architectures',
    items: [
      { name: 'Spring Boot', slug: 'spring', level: 96, element: 'geo' },
      { name: 'Spring Security', slug: 'spring', level: 82, element: 'geo' },
      { name: 'REST APIs', slug: 'postman', level: 95, element: 'hydro' },
      { name: 'JWT Auth', slug: 'jwt', level: 82, element: 'geo' },
      { name: 'Spring AMQP', slug: 'spring', level: 68, element: 'electro' },
      { name: 'RabbitMQ', slug: 'rabbitmq', level: 68, element: 'electro' },
      { name: 'Node.js', slug: 'nodejs', level: 75, element: 'anemo' }
    ]
  },
  {
    label: 'Frontend & UI',
    description: 'Component architecture, responsive styling, and modern web application frameworks',
    items: [
      { name: 'React', slug: 'react', level: 92, element: 'anemo' },
      { name: 'Next.js', slug: 'nextjs', level: 88, element: 'anemo' },
      { name: 'Tailwind CSS', slug: 'tailwind', level: 94, element: 'anemo' },
      { name: 'HTML5', slug: 'html', level: 95, element: 'anemo' },
      { name: 'CSS3', slug: 'css', level: 92, element: 'anemo' }
    ]
  },
  {
    label: 'Databases & Storage',
    description: 'Relational databases, document stores, ORMs, and migration tooling',
    items: [
      { name: 'MySQL', slug: 'mysql', level: 94, element: 'geo' },
      { name: 'PostgreSQL', slug: 'postgres', level: 70, element: 'geo' },
      { name: 'MongoDB', slug: 'mongodb', level: 86, element: 'hydro' },
      { name: 'Oracle DB', slug: 'oracle', level: 80, element: 'geo' },
      { name: 'Flyway', slug: 'java', level: 75, element: 'geo' }
    ]
  },
  {
    label: 'Testing & Quality',
    description: 'Automated test suites, mocking libraries, coverage analytics, and code audit engines',
    items: [
      { name: 'JUnit 5', slug: 'junit', level: 72, element: 'geo' },
      { name: 'Mockito', slug: 'java', level: 70, element: 'geo' },
      { name: 'Spring Boot Test', slug: 'spring', level: 92, element: 'geo' },
      { name: 'JaCoCo Coverage', slug: 'java', level: 88, element: 'geo' },
      { name: 'SonarQube Quality', slug: 'sonarqube', level: 86, element: 'geo' }
    ]
  },
  {
    label: 'DevOps & Tooling',
    description: 'Containerization, source control, API documentation, and agile lifecycle management',
    items: [
      { name: 'Docker', slug: 'docker', level: 80, element: 'geo' },
      { name: 'Git & GitHub', slug: 'github', level: 95, element: 'anemo' },
      { name: 'Postman', slug: 'postman', level: 98, element: 'hydro' },
      { name: 'Swagger / OpenAPI', slug: 'swagger', level: 80, element: 'hydro' },
      { name: 'Jira Agile', slug: 'jira', level: 68, element: 'geo' },
      { name: 'Figma', slug: 'figma', level: 85, element: 'anemo' }
    ]
  }
];

const CERT_BASE = 'https://it21826740.github.io/K.D.Dilini-Portfolio-2025/assets/img/portfolio/';

export const CERTIFICATES: Certificate[] = [
  { id: 1, title: 'Spring Boot & Microservices Mastery', issuer: 'Professional Development', url: `${CERT_BASE}certificate-1.jpeg`, rarity: 5, slot: 'Circlet of Logos' },
  { id: 2, title: 'Java Enterprise Architecture Certification', issuer: 'Technical Credential', url: `${CERT_BASE}certificate-2.jpeg`, rarity: 5, slot: 'Goblet of Eonothem' },
  { id: 3, title: 'REST API & Security Engineering', issuer: 'Professional Credential', url: `${CERT_BASE}certificate-3.jpeg`, rarity: 4, slot: 'Sands of Eon' },
  { id: 4, title: 'Full-Stack Web Development Specialization', issuer: 'SLIIT Academy', url: `${CERT_BASE}certificate-4.jpeg`, rarity: 5, slot: 'Plume of Death' },
  { id: 5, title: 'Database Design & SQL Optimization', issuer: 'Technical Institute', url: `${CERT_BASE}certificate-5.jpeg`, rarity: 4, slot: 'Flower of Life' },
  { id: 6, title: 'Software Engineering Best Practices & QA', issuer: 'Professional Institute', url: `${CERT_BASE}certificate-6.jpeg`, rarity: 5, slot: 'Circlet of Logos' },
  { id: 7, title: 'Python for Data & Edge Machine Learning', issuer: 'Engineering Credential', url: `${CERT_BASE}certificate-7.jpeg`, rarity: 5, slot: 'Goblet of Eonothem' },
  { id: 8, title: 'Android Mobile Application Architecture', issuer: 'Mobile Dev Track', url: `${CERT_BASE}certificate-8.jpeg`, rarity: 4, slot: 'Sands of Eon' },
  { id: 9, title: 'Agile & Collaborative Project Management', issuer: 'Industry Credential', url: `${CERT_BASE}certificate-9.jpeg`, rarity: 4, slot: 'Plume of Death' },
  { id: 10, title: 'Git Version Control & DevOps Workflows', issuer: 'Technical Credential', url: `${CERT_BASE}certificate-10.png`, rarity: 5, slot: 'Flower of Life' },
  { id: 11, title: 'Docker Containerization & Environments', issuer: 'DevOps Training', url: `${CERT_BASE}certificate-11.png`, rarity: 5, slot: 'Circlet of Logos' },
  { id: 12, title: 'IoT Sensors & Embedded Communications', issuer: 'Hardware/IoT Specialization', url: `${CERT_BASE}certificate-12.jpeg`, rarity: 4, slot: 'Goblet of Eonothem' },
  { id: 13, title: 'Diploma in English Language & Literature', issuer: 'Aquinas College of Higher Studies', url: `${CERT_BASE}certificate-13.jpeg`, rarity: 5, slot: 'Sands of Eon' },
];

export const YOUTUBE_CHANNELS = [
  {
    title: 'MT WORLDS',
    handle: '@MT_WORLDS',
    description: 'Explore creative video chronicles, digital projects, and creative worldbuilding.',
    url: 'https://www.youtube.com/@MT_WORLDS',
    type: 'Creative Channel'
  },
  {
    title: 'BREATHING SHADOWS',
    handle: '@BREATHINGSHADOWS-D',
    description: 'An introspective creative sanctuary sharing art, narratives, and video expressions.',
    url: 'https://www.youtube.com/@BREATHINGSHADOWS-D',
    type: 'Expression Channel'
  }
];
