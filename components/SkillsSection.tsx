'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Database, Cloud, Brain, GitBranch, Zap, Server, Smartphone } from 'lucide-react'

interface Skill {
  name: string
  level: number
  category: string
  icon: string
  description: string
  experience: string
}

interface SkillCategory {
  name: string
  icon: any
  color: string
  skills: Skill[]
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Languages',
    icon: Code,
    color: 'primary',
    skills: [
      { name: 'Python', level: 95, category: 'Languages', icon: '🐍', description: 'Primary language for backend development and data processing', experience: '3+ years' },
      { name: 'JavaScript', level: 90, category: 'Languages', icon: '🟨', description: 'Full-stack development with React and Node.js', experience: '2+ years' },
      { name: 'TypeScript', level: 85, category: 'Languages', icon: '🔷', description: 'Type-safe development for scalable applications', experience: '2+ years' },
      { name: 'C++', level: 80, category: 'Languages', icon: '⚙️', description: 'Data structures, algorithms, and system programming', experience: '2+ years' },
      { name: 'SQL', level: 90, category: 'Languages', icon: '🗃️', description: 'Complex queries, optimization, and database design', experience: '3+ years' },
      { name: 'Bash', level: 75, category: 'Languages', icon: '💻', description: 'Automation, scripting, and DevOps workflows', experience: '2+ years' }
    ]
  },
  {
    name: 'Frameworks',
    icon: Server,
    color: 'green',
    skills: [
      { name: 'Django', level: 95, category: 'Frameworks', icon: '🎯', description: 'RESTful APIs, ORM, and scalable web applications', experience: '2+ years' },
      { name: 'Flask', level: 85, category: 'Frameworks', icon: '🔥', description: 'Lightweight APIs and microservices', experience: '2+ years' },
      { name: 'React', level: 90, category: 'Frameworks', icon: '⚛️', description: 'Modern UI development with hooks and state management', experience: '2+ years' },
      { name: 'Node.js', level: 80, category: 'Frameworks', icon: '💚', description: 'Backend services and API development', experience: '1+ year' },
      { name: 'Next.js', level: 75, category: 'Frameworks', icon: '▲', description: 'Full-stack React applications with SSR', experience: '1+ year' }
    ]
  },
  {
    name: 'Cloud & DevOps',
    icon: Cloud,
    color: 'blue',
    skills: [
      { name: 'AWS', level: 90, category: 'Cloud', icon: '☁️', description: 'EC2, Lambda, RDS, S3, and infrastructure management', experience: '2+ years' },
      { name: 'Docker', level: 85, category: 'DevOps', icon: '🐳', description: 'Containerization and microservices deployment', experience: '2+ years' },
      { name: 'Kubernetes', level: 80, category: 'DevOps', icon: '⚓', description: 'Container orchestration and EKS management', experience: '1+ year' },
      { name: 'Terraform', level: 75, category: 'DevOps', icon: '🏗️', description: 'Infrastructure as Code and automation', experience: '1+ year' },
      { name: 'GitHub Actions', level: 80, category: 'DevOps', icon: '🔄', description: 'CI/CD pipelines and automation workflows', experience: '2+ years' }
    ]
  },
  {
    name: 'Data & AI',
    icon: Brain,
    color: 'purple',
    skills: [
      { name: 'PostgreSQL', level: 90, category: 'Database', icon: '🐘', description: 'Advanced queries, optimization, and scaling', experience: '3+ years' },
      { name: 'MongoDB', level: 75, category: 'Database', icon: '🍃', description: 'NoSQL design and document-based storage', experience: '1+ year' },
      { name: 'TensorFlow', level: 70, category: 'AI/ML', icon: '🧠', description: 'Machine learning models and TensorFlow Lite', experience: '1+ year' },
      { name: 'OpenAI API', level: 80, category: 'AI/ML', icon: '🤖', description: 'LLM integration and prompt engineering', experience: '1+ year' },
      { name: 'Prometheus', level: 70, category: 'Monitoring', icon: '📊', description: 'Metrics collection and observability', experience: '1+ year' },
      { name: 'Grafana', level: 70, category: 'Monitoring', icon: '📈', description: 'Data visualization and dashboards', experience: '1+ year' }
    ]
  }
]

const SkillsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  return (
    <section id="skills" className="py-20 bg-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">His Toolkit</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The technologies he&apos;s passionate about and uses to bring ideas to life
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            {skillCategories.map((category, index) => (
              <motion.button
                key={category.name}
                onClick={() => setSelectedCategory(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedCategory === index
                    ? 'border-primary-400 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <category.icon 
                  size={32} 
                  className={`mx-auto mb-2 ${
                    selectedCategory === index ? 'text-primary-400' : 'text-gray-400'
                  }`} 
                />
                <h3 className={`font-semibold ${
                  selectedCategory === index ? 'text-white' : 'text-gray-300'
                }`}>
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {category.skills.length} skills
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Skills Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillCategories[selectedCategory].skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <h4 className="font-semibold text-white">{skill.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-primary-400 font-medium">
                        {skill.experience}
                      </span>
                      <span className="text-sm text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mb-3">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Description */}
                  <AnimatePresence>
                    {hoveredSkill === skill.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-gray-400 leading-relaxed overflow-hidden"
                      >
                        {skill.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-primary-400 mb-2">6+</div>
              <div className="text-gray-400 text-sm">Programming Languages</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-primary-400 mb-2">10+</div>
              <div className="text-gray-400 text-sm">Frameworks & Libraries</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-primary-400 mb-2">5+</div>
              <div className="text-gray-400 text-sm">Cloud Services</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-primary-400 mb-2">3+</div>
              <div className="text-gray-400 text-sm">Years Experience</div>
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            Learning & Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h4 className="font-semibold text-white mb-2">B.S. Computer Science</h4>
              <p className="text-gray-400 text-sm">University of Maryland, Baltimore County</p>
              <p className="text-primary-400 text-sm mt-1">Minor in Statistics</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-4xl mb-4">☁️</div>
              <h4 className="font-semibold text-white mb-2">AWS Solutions</h4>
              <p className="text-gray-400 text-sm">EC2, Lambda, RDS, S3</p>
              <p className="text-primary-400 text-sm mt-1">Production Experience</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <h4 className="font-semibold text-white mb-2">DevOps & CI/CD</h4>
              <p className="text-gray-400 text-sm">Docker, Kubernetes, Terraform</p>
              <p className="text-primary-400 text-sm mt-1">Infrastructure as Code</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SkillsSection