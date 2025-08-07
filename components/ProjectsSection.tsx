'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Play, Brain, Hand, Database, Zap, Eye, Filter } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: string
  image: string
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
  features: string[]
  metrics?: string[]
  icon: any
}

const projects: Project[] = [
  {
    id: 'therasort',
    title: 'Therasort – AI Therapy Note Parser',
    description: 'Clinical note parser powered by Generative AI to assist therapists in organizing unstructured text data',
    longDescription: 'Designed a clinical note parser powered by Generative AI to assist therapists in organizing unstructured text data. Utilized OpenAI\'s language models to extract and classify issues into short-term, long-term, and temporary care categories.',
    technologies: ['Python', 'OpenAI API', 'MongoDB', 'Generative AI', 'UI Dashboard'],
    category: 'AI/ML',
    image: '/projects/therasort.jpg',
    githubUrl: 'https://github.com/hynr/therasort',
    features: [
      'Generative AI-powered text analysis',
      'Classification into care categories',
      'MongoDB data storage',
      'UI dashboard for visualization',
      'Patient insights filtering'
    ],
    metrics: ['Clinical workflow optimization', 'Automated text processing', 'Therapist productivity gains'],
    icon: Brain
  },
  {
    id: 'asl-translator',
    title: 'ASL Sign Language Translator',
    description: 'Real-time ASL classifier using webcam input and edge-optimized deep learning models',
    longDescription: 'Developed a real-time ASL classifier using webcam input and edge-optimized deep learning models. Achieved 92% accuracy using a custom OpenCV/Mediapipe dataset and optimized model for mobile deployment.',
    technologies: ['Python', 'OpenCV', 'Mediapipe', 'Flask', 'Deep Learning', 'Mobile Optimization'],
    category: 'AI/ML',
    image: '/projects/asl-translator.jpg',
    githubUrl: 'https://github.com/hynr/asl-translator',
    demoUrl: '#',
    features: [
      'Real-time webcam ASL recognition',
      '92% accuracy classification',
      'Edge-optimized deep learning',
      'Flask frontend deployment',
      'Mobile and local use support'
    ],
    metrics: ['92% accuracy achieved', 'Mobile deployment ready', 'Accessibility focused'],
    icon: Hand
  },
  {
    id: 'ecommerce-microservices',
    title: 'E-commerce Microservices Platform',
    description: 'Backend microservices for a 10K-user e-commerce simulation using Node.js and PostgreSQL',
    longDescription: 'Designed backend microservices for a 10K-user e-commerce simulation using Node.js and PostgreSQL. Integrated Redis for caching and async job queues, improving request throughput. Automated CI/CD with GitHub Actions for test coverage and AWS deployment.',
    technologies: ['Node.js', 'PostgreSQL', 'Redis', 'AWS', 'GitHub Actions', 'Microservices'],
    category: 'Backend',
    image: '/projects/ecommerce.jpg',
    githubUrl: 'https://github.com/hynr/ecommerce-microservices',
    features: [
      'Microservices architecture',
      '10K user capacity simulation',
      'Redis caching and job queues',
      'Automated CI/CD pipeline',
      'AWS cloud deployment'
    ],
    metrics: ['10K concurrent users', 'Improved request throughput', 'Automated deployment'],
    icon: Database
  }
]

const categories = ['All', 'AI/ML', 'Backend', 'Full Stack']

const ProjectsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory)

  return (
    <section id="projects" className="py-20 bg-gradient-to-br from-forest-900 to-sage-900/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">Stuff I&apos;ve Built</span>
          </h2>
          <p className="text-lg text-sage-300 max-w-2xl mx-auto">
            Some projects I&apos;m actually proud of! From helping therapists with AI to translating sign language - 
            each one taught me something new 🛠️
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="flex space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 border border-gray-700">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-primary-500/50 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary-500/10">
                  {/* Project Image/Icon */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                    <project.icon size={64} className="text-primary-400 group-hover:text-primary-300 transition-colors duration-300" />
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-gray-900/80 text-primary-400 text-xs rounded-full">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Metrics */}
                    {project.metrics && (
                      <div className="mb-4 space-y-1">
                        {project.metrics.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-400">
                            <Zap size={12} className="mr-2 text-primary-400" />
                            {metric}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        {project.githubUrl && (
                          <motion.a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                          >
                            <Github size={16} className="text-gray-300" />
                          </motion.a>
                        )}
                        {project.liveUrl && (
                          <motion.a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                          >
                            <ExternalLink size={16} className="text-white" />
                          </motion.a>
                        )}
                        {project.demoUrl && (
                          <motion.a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                          >
                            <Play size={16} className="text-white" />
                          </motion.a>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                      >
                        {selectedProject === project.id ? 'Show Less' : 'Learn More'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedProject === project.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-700 p-6"
                      >
                        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                          {project.longDescription}
                        </p>
                        
                        <h4 className="text-white font-semibold mb-3">Key Features</h4>
                        <ul className="space-y-2 mb-4">
                          {project.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <h4 className="text-white font-semibold mb-3">All Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">Want to see more of my work?</p>
          <motion.a
            href="https://github.com/hynr"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-primary-400 text-gray-300 hover:text-primary-400 rounded-lg font-medium transition-all duration-200"
          >
            <Github size={20} className="mr-2" />
            View All Projects on GitHub
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection