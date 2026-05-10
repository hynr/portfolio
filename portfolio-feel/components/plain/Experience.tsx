import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Experience() {
  return (
    <section id="experience" className="section-spacing bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 hidden md:block"></div>

            {PORTFOLIO_DATA.experience.map((exp, index) => (
              <div key={exp.id} className="relative mb-12 md:mb-16 last:mb-0">
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg hidden md:block"></div>

                {/* Content */}
                <div className="md:ml-20">
                  <div className="bg-gray-50 rounded-xl p-8 card-hover">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{exp.role}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="text-xl font-semibold text-blue-600">{exp.company}</h4>
                        <span className="text-gray-600 font-medium">{exp.duration}</span>
                      </div>
                      <p className="text-gray-600">{exp.location}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-6 leading-relaxed">{exp.description}</p>

                    {/* Achievements */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Key Achievements:</h5>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Technologies Used:</h5>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Status */}
          <div className="text-center mt-12 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Currently Available
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for New Opportunities</h3>
            <p className="text-gray-700 mb-4">
              I'm always interested in exciting projects and new challenges. 
              Let's discuss how we can work together!
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">💬</span>
              Let's Talk
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}