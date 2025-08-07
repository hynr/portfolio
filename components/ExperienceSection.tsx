'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, ExternalLink, ChevronRight, Code, Database, Cloud, Users } from 'lucide-react'

interface Experience {
  id: string
  title: string
  company: string
  location: string
  period: string
  type: string
  description: string
  achievements: string[]
  technologies: string[]
  icon: any
}

const experiences: Experience[] = [
  {
    id: 'ta-current',
    title: 'Undergraduate Teaching Assistant',
    company: 'University of Maryland, Baltimore County',
    location: 'Baltimore, MD',
    period: 'Aug 2024 – May 2025',
    type: 'Part-time',
    description: 'Teaching Data Structures & Algorithms to 300+ students using C++',
    achievements: [
      'Instructed 300+ students on object-oriented programming, recursion, memory, and algorithm analysis using C++',
      'Built scripts using Bash and PowerShell to automate grading pipelines and handle ETL datasets',
      'Used Linux, SSH, Git, and Emacs/Vim for systems-level debugging and code review training',
      'Improved student understanding through hands-on coding sessions and office hours'
    ],
    technologies: ['C++', 'Bash', 'PowerShell', 'Linux', 'Git', 'SSH'],
    icon: Users
  },
  {
    id: 'horizen',
    title: 'Software Engineer',
    company: 'Horizen Labs - Innovation Lab',
    location: 'Remote',
    period: 'Jun 2024 – Aug 2024',
    type: 'Internship',
    description: 'Developed proof-of-concept tools for early-stage crypto startups',
    achievements: [
      'Developed proof-of-concept tools for early-stage crypto startups, including a smart contract explorer and ID verification dashboard',
      'Delivered MVPs using Python, React, and PostgreSQL, resulting in enhanced startup visibility',
      'Helped secure investment interest valued at over $500K during demo day launches',
      'Collaborated with founders on technical direction and investor presentations',
      'Contributed to fast iterations under tight deadlines and helped teams prep product demos'
    ],
    technologies: ['Python', 'React', 'PostgreSQL', 'Smart Contracts', 'Web3'],
    icon: Code
  },
  {
    id: 'sprouts',
    title: 'Front-End Engineer (Contract)',
    company: 'Sprouts Spot Learning Center',
    location: 'Catonsville, MD',
    period: 'Sep 2023 – Dec 2023',
    type: 'Contract',
    description: 'Built interactive web features for class and calendar scheduling',
    achievements: [
      'Built interactive web features using React, JavaScript, and REST APIs for class and calendar scheduling',
      'Reduced latency 30% by optimizing SQL queries and integrating with Angular-style modular endpoints',
      'Collaborated with UX/UI designers and QA to deploy feature-complete updates following team testing plans',
      'Enhanced user experience through responsive design and intuitive interfaces'
    ],
    technologies: ['React', 'JavaScript', 'REST APIs', 'SQL', 'Angular'],
    icon: Code
  },
]

const ExperienceSection = () => {
  const [selectedExperience, setSelectedExperience] = useState<string>(experiences[0].id)

  return (
    <section id="experience" className="py-20 bg-gradient-to-br from-dark-100 to-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono">
            <span className="gradient-text">EXPERIENCE.LOG</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
            // Journey from &quot;Hello World&quot; to 100K+ user systems
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedExperience === exp.id
                      ? 'transform scale-105'
                      : 'hover:transform hover:scale-102'
                  }`}
                  onClick={() => setSelectedExperience(exp.id)}
                >
                  <div
                    className={`p-6 rounded-lg border transition-all duration-300 ${
                      selectedExperience === exp.id
                        ? 'bg-primary-500/10 border-primary-400 shadow-lg shadow-primary-500/20'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          selectedExperience === exp.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        <exp.icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-lg ${
                          selectedExperience === exp.id ? 'text-white' : 'text-gray-300'
                        }`}>
                          {exp.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{exp.company}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {exp.period}
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`transform transition-transform duration-300 ${
                          selectedExperience === exp.id
                            ? 'rotate-90 text-primary-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Experience Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {experiences.map((exp) => (
                selectedExperience === exp.id && (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                        <p className="text-lg text-primary-400 mb-2">{exp.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2" />
                            {exp.period}
                          </div>
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2" />
                            {exp.location}
                          </div>
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                            {exp.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {exp.description}
                    </p>

                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-4">Key Achievements</h4>
                      <div className="space-y-3">
                        {exp.achievements.map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-300 leading-relaxed">{achievement}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, index) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium border border-primary-500/30"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceSection