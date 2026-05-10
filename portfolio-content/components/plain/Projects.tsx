'use client'

import { useState } from 'react'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const categories = ['All', ...Array.from(new Set(PORTFOLIO_DATA.projects.map(p => p.category)))]
  
  const filteredProjects = selectedCategory === 'All' 
    ? PORTFOLIO_DATA.projects 
    : PORTFOLIO_DATA.projects.filter(p => p.category === selectedCategory)

  const selectedProjectData = selectedProject 
    ? PORTFOLIO_DATA.projects.find(p => p.id === selectedProject)
    : null

  return (
    <section id="projects" className="section-spacing bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Projects
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-8"></div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                {/* Project Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {project.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{project.year}</span>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
                  
                  {/* Impact */}
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-semibold text-gray-900 mr-2">Impact:</span>
                    <span className="text-sm text-purple-600 font-medium">{project.impact}</span>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Actions */}
                <div className="px-6 pb-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedProject(project.id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    View Details
                  </button>
                  
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Project Detail Modal */}
          {selectedProject && selectedProjectData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedProjectData.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {selectedProjectData.category}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          {selectedProjectData.year}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedProjectData.longDescription}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {selectedProjectData.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics */}
                  {selectedProjectData.metrics && selectedProjectData.metrics.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Metrics & Results</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {selectedProjectData.metrics.map((metric, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <span className="text-green-800 font-medium">{metric}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProjectData.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {selectedProjectData.githubUrl && (
                      <a
                        href={selectedProjectData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        View on GitHub
                      </a>
                    )}
                    
                    {selectedProjectData.liveUrl && (
                      <a
                        href={selectedProjectData.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Live Demo
                      </a>
                    )}

                    {selectedProjectData.demoUrl && (
                      <a
                        href={selectedProjectData.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Watch Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}