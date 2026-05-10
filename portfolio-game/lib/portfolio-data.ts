export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: 'AI/ML' | 'Backend' | 'Full Stack' | 'Frontend'
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
  features: string[]
  metrics?: string[]
  year: number
  impact: string  // e.g., "100K+ users", "92% accuracy"
}

export interface Skill {
  name: string
  level: number  // 0-100
  category: 'Languages' | 'Frameworks' | 'Cloud & DevOps' | 'Data & AI'
  icon: string  // emoji or icon identifier
  description: string
  experience: string  // e.g., "3+ years"
}

export interface Link {
  type: 'github' | 'linkedin' | 'email' | 'twitter' | 'website'
  url: string
  label: string
}

export interface Bio {
  name: string
  title: string
  location: string
  company: string
  mission: string
  status: string
  email: string
  summary: string
  highlights: string[]  // Key achievements
}

export const PORTFOLIO_DATA = {
  bio: {
    name: 'Huzaifa',
    title: 'Full-Stack Developer',
    location: 'Columbia, MD',
    company: 'HZSR',
    mission: 'Building systems that serve 100K+ users',
    status: 'Always learning, always building',
    email: 'huzaifa478@gmail.com',
    summary: 'Software Engineer specializing in Python, React, AWS, and AI/ML',
    highlights: [
      '100K+ users reached',
      '6+ years coding experience',
      'B.S. Computer Science, UMBC'
    ]
  },
  projects: [
    {
      id: 'therasort',
      title: 'Therasort – AI Therapy Note Parser',
      description: 'Clinical note parser powered by Generative AI',
      longDescription: 'Designed a clinical note parser powered by Generative AI to streamline therapy documentation and improve clinical workflow efficiency.',
      technologies: ['Python', 'OpenAI API', 'MongoDB', 'Generative AI'],
      category: 'AI/ML' as const,
      githubUrl: 'https://github.com/hynr/therasort',
      features: [
        'Generative AI-powered text analysis',
        'Classification into care categories',
        'MongoDB data storage'
      ],
      metrics: ['Clinical workflow optimization', 'Therapist productivity gains'],
      year: 2024,
      impact: 'Clinical workflow optimization'
    },
    {
      id: 'portfolio-game',
      title: 'Interactive Portfolio Game',
      description: 'Mario-inspired platform game showcasing portfolio content',
      longDescription: 'A creative interactive portfolio where skills become collectible coins and projects turn into discoverable question blocks in a Mario-style platformer.',
      technologies: ['React', 'TypeScript', 'Canvas API', 'CSS Animations'],
      category: 'Frontend' as const,
      features: [
        'Real-time 2D physics engine',
        'Interactive portfolio elements',
        'Mobile-responsive controls'
      ],
      year: 2024,
      impact: 'Innovative portfolio presentation'
    }
  ],
  skills: [
    {
      name: 'Python',
      level: 95,
      category: 'Languages' as const,
      icon: '🐍',
      description: 'Primary language for backend and data processing',
      experience: '3+ years'
    },
    {
      name: 'React',
      level: 90,
      category: 'Frameworks' as const,
      icon: '⚛️',
      description: 'Frontend framework for interactive applications',
      experience: '2+ years'
    },
    {
      name: 'TypeScript',
      level: 85,
      category: 'Languages' as const,
      icon: '📘',
      description: 'Type-safe JavaScript for scalable applications',
      experience: '2+ years'
    },
    {
      name: 'AWS',
      level: 80,
      category: 'Cloud & DevOps' as const,
      icon: '☁️',
      description: 'Cloud infrastructure and serverless architecture',
      experience: '2+ years'
    },
    {
      name: 'Machine Learning',
      level: 75,
      category: 'Data & AI' as const,
      icon: '🤖',
      description: 'AI/ML model development and deployment',
      experience: '1+ year'
    }
  ],
  links: [
    { type: 'github' as const, url: 'https://github.com/hynr', label: 'GitHub' },
    { type: 'linkedin' as const, url: 'https://linkedin.com/in/huzaifa-naroo', label: 'LinkedIn' },
    { type: 'email' as const, url: 'mailto:huzaifa478@gmail.com', label: 'Email' }
  ]
} as const