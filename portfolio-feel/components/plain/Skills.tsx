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
    <section id="skills" className="section-spacing bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Skills & Expertise
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                data-skill={skill.name}
                className="bg-gray-50 rounded-xl p-6 card-hover"
              >
                {/* Skill Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{skill.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                      <span className="text-sm text-gray-600 font-medium">{skill.experience}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{skill.level}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {skill.category}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="skill-bar mb-4">
                  <div
                    className="skill-progress"
                    style={{
                      width: animatedSkills.has(skill.name) ? `${skill.level}%` : '0%',
                    }}
                  ></div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed">{skill.description}</p>
              </div>
            ))}
          </div>

          {/* Skills Summary */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Skills Overview</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              {categories.slice(1).map((category) => {
                const categorySkills = PORTFOLIO_DATA.skills.filter(s => s.category === category)
                const averageLevel = categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length
                
                return (
                  <div key={category} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(averageLevel)}%
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{category}</h4>
                    <p className="text-sm text-gray-600">{categorySkills.length} skills</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
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