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
    id: 'hzsr',
    title: 'Software Engineer',
    company: 'HZSR - Real Estate Data Intelligence Platform',
    location: 'Remote',
    period: 'Jul 2024 – Present',
    type: 'Full-time',
    description: 'Building scalable backend services and data pipelines for 100K+ real estate users',
    achievements: [
      'Developed and scaled backend services using Python (Django) and PostgreSQL',
      'Re-architected data pipelines, cutting report generation time by 55%',
      'Provisioned AWS infrastructure (EC2, Lambda, RDS, S3) using Terraform',
      'Led CI/CD automation with Docker and Kubernetes (EKS) across multiple regions',
      'Integrated national MLS APIs with OAuth2 for secure data ingestion',
      'Deployed observability stack, reducing incident response from 2 hours to 12 minutes'
    ],
    technologies: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'],
    icon: Cloud
  },
  {
    id: 'sprouts',
    title: 'Software Engineer Intern',
    company: 'Sprouts Spot',
    location: 'Clarksville, MD',
    period: 'Sep 2023 – Dec 2023',
    type: 'Internship',
    description: 'Built internal dashboards and optimized backend performance for educational platform',
    achievements: [
      'Built internal dashboards using React, Node.js, and TypeScript',
      'Optimized 12+ queries and indexed PostgreSQL tables',
      'Reduced backend latency from 10s to under 3s',
      'Partnered with non-technical staff to automate scheduling workflows',
      'Boosted internal platform adoption through user-friendly automation'
    ],
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    icon: Code
  },
  {
    id: 'ta',
    title: 'Teaching Assistant – Data Structures and Algorithms',
    company: 'University of Maryland, Baltimore County',
    location: 'Baltimore, MD',
    period: 'Aug 2023 – May 2024',
    type: 'Part-time',
    description: 'Taught core C++ concepts and automated grading workflows for 300+ students',
    achievements: [
      'Taught core C++ concepts, recursion, and memory allocation to 300+ students',
      'Improved course pass rate by 18% through effective instruction',
      'Automated grading workflows using Bash/PowerShell scripting',
      'Held weekly office hours and exam review sessions',
      'Helped students strengthen foundational algorithmic thinking'
    ],
    technologies: ['C++', 'Bash', 'PowerShell'],
    icon: Users
  }
]

const ExperienceSection = () => {
  const [selectedExperience, setSelectedExperience] = useState<string>(experiences[0].id)

  return (
    <section id="experience" className="py-20 bg-gradient-to-br from-sage-900/30 to-forest-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">My Story So Far</span>
          </h2>
          <p className="text-lg text-sage-300 max-w-2xl mx-auto">
            From struggling with my first &quot;Hello World&quot; to helping systems serve 100K+ people... 
            it&apos;s been quite the ride! ☕✨
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