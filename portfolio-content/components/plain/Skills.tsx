'use client'

import { useState, useEffect } from 'react'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [animatedSkills, setAnimatedSkills] = useState<Set<string>>(new Set())

  const categories = ['All', ...Array.from(new Set(PORTFOLIO_DATA.skills.map(s => s.category)))]
  
  const filteredSkills = selectedCategory === 'All' 
    ? PORTFOLIO_DATA.skills 
    : PORTFOLIO_DATA.skills.filter(s => s.category === selectedCategory)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const skillName = entry.target.getAttribute('data-skill')
            if (skillName) {
              setAnimatedSkills(prev => new Set(prev).add(skillName))
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    const skillElements = document.querySelectorAll('[data-skill]')
    skillElements.forEach(el => observer.observe(el))

    return () => {
      skillElements.forEach(el => observer.unobserve(el))
    }
  }, [filteredSkills])

  return (
    <section id="skills" className="py-16 md:py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skills & Expertise
            </h2>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-6 md:mb-8"></div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive overview of my technical skills and expertise across different domains
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 text-sm md:text-base ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid gap-6 md:gap-8 sm:grid-cols-1 lg:grid-cols-2 mt-12">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                data-skill={skill.name}
                className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
              >
                {/* Skill Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 sm:gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xl">{skill.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{skill.name}</h3>
                      <span className="text-xs md:text-sm text-gray-600 font-medium">{skill.experience}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{skill.level}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-medium px-2 py-1 bg-gray-50 rounded-md">
                      {skill.category}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Proficiency</span>
                    <span className="text-xs font-bold text-gray-700">{skill.level}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: animatedSkills.has(skill.name) ? `${skill.level}%` : '0%',
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{skill.description}</p>
              </div>
            ))}
          </div>

          {/* Skills Summary */}
          <div className="mt-16 md:mt-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 md:p-10 border border-blue-100 shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 md:mb-10 text-center">Skills Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(1).map((category) => {
                const categorySkills = PORTFOLIO_DATA.skills.filter(s => s.category === category)
                const averageLevel = categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length
                
                return (
                  <div key={category} className="text-center group cursor-pointer">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 group-hover:scale-105 transition-transform duration-300">
                      <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {Math.round(averageLevel)}%
                      </div>
                    </div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{category}</h4>
                    <p className="text-xs md:text-sm text-gray-600">{categorySkills.length} skills</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 md:mt-10 text-center">
              <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
                I'm passionate about continuously learning and staying up-to-date with the latest 
                technologies. My diverse skill set allows me to work across the full stack, from 
                database design to user interface development, with a special focus on AI/ML applications.
              </p>
            </div>
          </div>

          {/* Certifications/Learning */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Continuous Learning</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">🎓</div>
                <h4 className="font-semibold text-gray-900 mb-2">B.S. Computer Science</h4>
                <p className="text-sm text-gray-600">UMBC - Strong foundation in CS fundamentals</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">🚀</div>
                <h4 className="font-semibold text-gray-900 mb-2">Self-Directed Learning</h4>
                <p className="text-sm text-gray-600">Always exploring new frameworks and technologies</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">🏗️</div>
                <h4 className="font-semibold text-gray-900 mb-2">Hands-On Projects</h4>
                <p className="text-sm text-gray-600">Learning through building real-world applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}