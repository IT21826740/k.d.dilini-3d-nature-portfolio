import { DILINI_PROFILE, PROJECTS, SKILL_CATEGORIES, CERTIFICATES, YOUTUBE_CHANNELS } from './portfolioData';

export interface WorldInteractable {
  id: string;
  type: 'profile' | 'projects' | 'skills' | 'certificates' | 'dispatches' | 'contact';
  name: string;
  badge: string;
  icon: string;
  glowColor: string;
  worldPos: [number, number, number]; // [x, y, z] on the 3D island
  radius: number; // Proximity trigger radius
  previewSnippet: string;
  details: {
    title: string;
    subtitle: string;
    description: string;
    highlights?: string[];
  };
}

export const WORLD_INTERACTABLES: WorldInteractable[] = [
  {
    id: 'poi-profile',
    type: 'profile',
    name: 'Dilini\'s Hermitage & Monument',
    badge: 'Character Sanctuary',
    icon: '👤',
    glowColor: '#10b981', // Emerald
    worldPos: [0, 1.2, 5],
    radius: 3.5,
    previewSnippet: 'Meet K.D. Dilini — Full Stack Java & Spring Boot engineer.',
    details: {
      title: 'K.D. Dilini',
      subtitle: 'Full Stack Java Developer · SLIIT Graduate',
      description:
        'A dedicated software engineer with deep mastery in Java, Spring Boot, microservices architecture, and IoT edge systems. Graduated with a BSc (Hons) in Information Technology from Sri Lanka Institute of Information Technology (SLIIT).',
      highlights: [
        'Core Focus: Enterprise Java, Spring Boot, Spring Security & JWT',
        'System Design: REST APIs, Event-driven RabbitMQ & Distributed Messaging',
        'Databases: MySQL, PostgreSQL, MongoDB, Oracle DB & Flyway Migrations',
        'Location: Sri Lanka · Available for remote & international engineering roles'
      ]
    }
  },
  {
    id: 'poi-tree',
    type: 'projects',
    name: 'Ancient Architecture Tree',
    badge: '14+ Shipped Projects',
    icon: '🌳',
    glowColor: '#fbbf24', // Amber/Gold
    worldPos: [-4.5, 1.2, -2],
    radius: 4.2,
    previewSnippet: 'Inspect 14+ shipped projects including Edge-AI Smart Glasses & Enterprise Management.',
    details: {
      title: 'Archive of Built Systems',
      subtitle: 'Research, Enterprise & Full-Stack Projects',
      description:
        'Beneath the great oak branches lie the codebases and architecture diagrams of 14+ production and research systems built across Java, Python, C, Kotlin, and React.',
      highlights: [
        'AI-Powered Smart Glasses: Offline TinyML, MobileNetV2 & Sinhala/English OCR on Raspberry Pi 5',
        'Italian English Institute MS: Enterprise Spring Boot 4-tier management system with JWT & Flyway',
        'Distributed RabbitMQ: Asynchronous publisher/consumer microservice pipeline with Spring AMQP',
        'AuraLink: AI-integrated environmental IoT node with Groq Llama 3.3 and MQTT protocols'
      ]
    }
  },
  {
    id: 'poi-waterfall',
    type: 'skills',
    name: 'Cascade of Streaming APIs',
    badge: '30+ Technologies',
    icon: '🌊',
    glowColor: '#38bdf8', // Sky Blue
    worldPos: [7.5, 1.2, -1],
    radius: 4.0,
    previewSnippet: 'Listen to the streaming data waters and explore 30+ mastered engineering skills.',
    details: {
      title: 'Living Skills Stream',
      subtitle: 'Backend, Testing, Databases & DevOps',
      description:
        'Like the endless rushing spring water, Dilini\'s skills flow from low-level systems programming in C to modern reactive Spring Boot backends and containerized cloud setups.',
      highlights: [
        'Languages: Java (96%), JavaScript (90%), Kotlin (86%), Python (88%), C/C++',
        'Backend: Spring Boot 3, Spring Security, RESTful APIs, Spring AMQP, JWT',
        'Testing & QA: JUnit 5, Mockito, JaCoCo Code Coverage, SonarQube Quality Gates',
        'Tooling & DevOps: Docker, Git, GitHub, Postman, Swagger/OpenAPI, Linux'
      ]
    }
  },
  {
    id: 'poi-stones',
    type: 'certificates',
    name: 'Monoliths of Accreditation',
    badge: '13 Verified Relics',
    icon: '🏛️',
    glowColor: '#a78bfa', // Purple
    worldPos: [3.5, 1.2, 4],
    radius: 3.8,
    previewSnippet: 'Ancient standing stones engraved with 13 verified industry & university certificates.',
    details: {
      title: 'Hall of Credentials',
      subtitle: '13 Verified Industry Certificates',
      description:
        'Standing monolithic tablets honoring continuous technical and academic achievements across Java enterprise engineering, databases, mobile architectures, and English language scholarship.',
      highlights: [
        'Spring Boot & Microservices Mastery Certificate',
        'Java Enterprise Architecture & Security Engineering Credentials',
        'SLIIT Full-Stack Web Development Specialization',
        'Diploma in English Language & Literature (Aquinas College)'
      ]
    }
  },
  {
    id: 'poi-camp',
    type: 'dispatches',
    name: 'Campfire of Innovation',
    badge: 'Live GitHub & Media',
    icon: '🔥',
    glowColor: '#f87171', // Warm Coral / Fire
    worldPos: [-5, 1.2, 4],
    radius: 3.5,
    previewSnippet: 'Gather by the warm embers to see live GitHub commits & YouTube worldbuilding.',
    details: {
      title: 'Field Dispatches & Media',
      subtitle: 'Live GitHub Telemetry & YouTube Publications',
      description:
        'Live telemetric sync with GitHub profile @IT21826740 alongside creative YouTube video channels documenting worldbuilding and creative digital expressions.',
      highlights: [
        'Live Sync with GitHub: 14+ public repositories with active commits & stars',
        'YouTube Channel: MT WORLDS (Creative explorations & digital projects)',
        'YouTube Channel: BREATHING SHADOWS (Artistic narratives & creative audio)',
        'Continuous open-source contributions and software lab experiments'
      ]
    }
  },
  {
    id: 'poi-shrine',
    type: 'contact',
    name: 'Pavilion of Inquiries',
    badge: 'Direct Dispatch Desk',
    icon: '✉️',
    glowColor: '#facc15', // Gold
    worldPos: [0, 1.2, -5.5],
    radius: 3.8,
    previewSnippet: 'Step inside the peaceful gazebo to transmit a message or download Dilini\'s CV.',
    details: {
      title: 'Collaborate & Commission',
      subtitle: 'Direct Channels & Resume Download',
      description:
        'The peaceful shrine is the primary gathering post to hire, collaborate with, or commission K.D. Dilini for full-stack Java development, APIs, or software systems.',
      highlights: [
        'Email: dchathurya3@gmail.com / k.d.dilinik.a.c.r.e.2016@gmail.com',
        'Phone & WhatsApp: +94 75 314 0177',
        'Direct SMS Preparation & instant inquiry dispatch',
        'Downloadable full PDF CV & one-click Vercel-ready ZIP package'
      ]
    }
  }
];
