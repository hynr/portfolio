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
  impact: string
}

export interface Skill {
  name: string
  level: number
  category: 'Languages' | 'Frameworks' | 'Cloud & DevOps' | 'Data & AI'
  icon: string
  description: string
  experience: string
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
  url: string
  description: string
  summary: string
  highlights: string[]
}

export interface Experience {
  id: string
  company: string
  role: string
  duration: string
  location: string
  description: string
  achievements: string[]
  technologies: string[]
}

export const PORTFOLIO_DATA = {
  bio: {
    name: 'Huzaifa Naroo',
    title: 'Full-Stack Developer',
    location: 'Columbia, MD',
    company: 'HZSR',
    mission: 'Building systems that serve 100K+ users',
    status: 'Always learning, always building',
    email: 'huzaifa478@gmail.com',
    url: 'https://hynr.github.io/portfolio',
    description:
      'Full-stack engineer at the seam of AI and product. Six years shipping clinical AI, real-time analytics, and serverless data pipelines reaching 100K+ users.',
    summary: 'Software Engineer specializing in Python, React, AWS, and AI/ML with 6+ years of experience building scalable applications and data-driven solutions.',
    highlights: [
      '100K+ users reached',
      '6+ years coding experience',
      'B.S. Computer Science, UMBC',
      'Full-stack and AI/ML specialist'
    ]
  },
  
  experience: [
    {
      id: 'hzsr',
      company: 'HZSR',
      role: 'Founder & Lead Developer',
      duration: '2023 - Present',
      location: 'Columbia, MD',
      description: 'Leading development of innovative software solutions with focus on AI/ML applications and scalable web platforms.',
      achievements: [
        'Built AI-powered clinical note parser serving healthcare professionals',
        'Developed multiple full-stack applications with 100K+ user reach',
        'Implemented cloud infrastructure on AWS with 99.9% uptime'
      ],
      technologies: ['Python', 'React', 'AWS', 'OpenAI API', 'MongoDB', 'TypeScript']
    },
    {
      id: 'umbc',
      company: 'University of Maryland, Baltimore County',
      role: 'Computer Science Student',
      duration: '2021 – 2025',
      location: 'Baltimore, MD',
      description: 'Bachelor of Science in Computer Science with focus on software engineering, algorithms, and machine learning.',
      achievements: [
        'Relevant coursework in Data Structures, Algorithms, and Software Engineering',
        'Projects in web development, AI/ML, and system design',
        'Strong foundation in computer science fundamentals'
      ],
      technologies: ['Java', 'Python', 'C++', 'JavaScript', 'SQL', 'Git']
    }
  ],

  projects: [
    {
      id: 'therasort',
      title: 'Therasort – AI Therapy Note Parser',
      description: 'Clinical note parser powered by Generative AI for therapy workflow optimization',
      longDescription: 'Designed and built a clinical note parser powered by Generative AI to help therapists efficiently categorize and analyze patient notes. The system uses OpenAI API for intelligent text analysis and classification, storing structured data in MongoDB for easy retrieval and reporting.',
      technologies: ['Python', 'OpenAI API', 'MongoDB', 'Generative AI', 'FastAPI', 'React'],
      category: 'AI/ML' as const,
      githubUrl: 'https://github.com/hynr/therasort',
      features: [
        'Generative AI-powered text analysis and categorization',
        'Intelligent classification into therapeutic care categories',
        'MongoDB data storage with structured querying',
        'RESTful API for seamless integration',
        'User-friendly web interface for therapists'
      ],
      metrics: ['Clinical workflow optimization', 'Reduced note processing time by 70%'],
      year: 2024,
      impact: 'Clinical workflow optimization for therapy practices'
    },
    {
      id: 'portfolio-mario',
      title: 'Interactive Mario Portfolio',
      description: 'Dual-mode portfolio website with traditional content view and playable Mario-inspired game mode',
      longDescription: 'A unique portfolio website featuring both a professional content mode and an interactive Mario-inspired game mode. Built with Next.js 14 and TypeScript, it showcases projects and skills through traditional web sections or as collectible items in a platformer game.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Canvas API', 'React'],
      category: 'Full Stack' as const,
      githubUrl: 'https://github.com/hynr/portfolio',
      features: [
        'Dual-mode interface: content and game modes',
        'Interactive Mario-inspired platformer gameplay',
        'Responsive design with mobile optimization',
        'Smooth mode switching with localStorage persistence',
        'Accessibility features and reduced motion support'
      ],
      metrics: ['100% accessibility score', '< 100ms interaction delays'],
      year: 2024,
      impact: 'Innovative portfolio presentation reaching 100K+ users'
    },
    {
      id: 'data-pipeline',
      title: 'AWS Data Processing Pipeline',
      description: 'Serverless data processing pipeline for large-scale analytics workloads',
      longDescription: 'Built a scalable serverless data processing pipeline using AWS Lambda, S3, and DynamoDB to handle large-scale analytics workloads. The system processes millions of records daily with automated error handling and monitoring.',
      technologies: ['AWS Lambda', 'Python', 'DynamoDB', 'S3', 'CloudWatch', 'Boto3'],
      category: 'Backend' as const,
      features: [
        'Serverless architecture with auto-scaling',
        'Real-time data processing and transformation',
        'Automated error handling and retry logic',
        'Comprehensive monitoring and alerting',
        'Cost-optimized with pay-per-use model'
      ],
      metrics: ['Processes 1M+ records daily', '99.9% uptime', '60% cost reduction'],
      year: 2023,
      impact: 'Scalable data processing for enterprise analytics'
    },
    {
      id: 'react-dashboard',
      title: 'Real-time Analytics Dashboard',
      description: 'Modern React dashboard with real-time data visualization and interactive charts',
      longDescription: 'Developed a comprehensive analytics dashboard using React and D3.js for real-time data visualization. Features interactive charts, customizable widgets, and responsive design for monitoring key business metrics.',
      technologies: ['React', 'TypeScript', 'D3.js', 'Chart.js', 'WebSocket', 'Tailwind CSS'],
      category: 'Frontend' as const,
      features: [
        'Real-time data updates via WebSocket connections',
        'Interactive and customizable chart components',
        'Responsive design for all device sizes',
        'Advanced filtering and data manipulation',
        'Export functionality for reports and analytics'
      ],
      metrics: ['50+ interactive charts', '<100ms render time', '95% user satisfaction'],
      year: 2023,
      impact: 'Enhanced data-driven decision making for business teams'
    }
  ],

  skills: [
    {
      name: 'Python',
      level: 95,
      category: 'Languages' as const,
      icon: '🐍',
      description: 'Primary language for backend development, data processing, and AI/ML applications',
      experience: '4+ years'
    },
    {
      name: 'JavaScript/TypeScript',
      level: 90,
      category: 'Languages' as const,
      icon: '📜',
      description: 'Expert in modern JavaScript and TypeScript for full-stack development',
      experience: '3+ years'
    },
    {
      name: 'React',
      level: 88,
      category: 'Frameworks' as const,
      icon: '⚛️',
      description: 'Building modern, responsive user interfaces with hooks and state management',
      experience: '3+ years'
    },
    {
      name: 'Next.js',
      level: 85,
      category: 'Frameworks' as const,
      icon: '🔺',
      description: 'Full-stack React framework for production-ready applications',
      experience: '2+ years'
    },
    {
      name: 'AWS',
      level: 82,
      category: 'Cloud & DevOps' as const,
      icon: '☁️',
      description: 'Cloud infrastructure, serverless computing, and DevOps practices',
      experience: '2+ years'
    },
    {
      name: 'FastAPI',
      level: 80,
      category: 'Frameworks' as const,
      icon: '🚀',
      description: 'Modern Python web framework for building high-performance APIs',
      experience: '2+ years'
    },
    {
      name: 'MongoDB',
      level: 78,
      category: 'Data & AI' as const,
      icon: '🍃',
      description: 'NoSQL database design, optimization, and integration',
      experience: '2+ years'
    },
    {
      name: 'Machine Learning',
      level: 75,
      category: 'Data & AI' as const,
      icon: '🤖',
      description: 'AI/ML model development, OpenAI API integration, and data analysis',
      experience: '2+ years'
    },
    {
      name: 'Docker',
      level: 70,
      category: 'Cloud & DevOps' as const,
      icon: '🐳',
      description: 'Containerization for development and deployment workflows',
      experience: '2+ years'
    },
    {
      name: 'SQL',
      level: 75,
      category: 'Data & AI' as const,
      icon: '🗃️',
      description: 'Database design, optimization, and complex query development',
      experience: '3+ years'
    }
  ],

  links: [
    { type: 'github' as const, url: 'https://github.com/hynr', label: 'GitHub' },
    { type: 'linkedin' as const, url: 'https://linkedin.com/in/huzaifa-naroo', label: 'LinkedIn' },
    { type: 'email' as const, url: 'mailto:huzaifa478@gmail.com', label: 'Email' },
    { type: 'website' as const, url: 'https://hzsr.dev', label: 'Portfolio' }
  ]
} as const

export type PortfolioData = typeof PORTFOLIO_DATA