import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function About() {
  return (
    <section id="about" className="section-spacing bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Bio Content */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Hello! I'm {PORTFOLIO_DATA.bio.name}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {PORTFOLIO_DATA.bio.summary}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Based in {PORTFOLIO_DATA.bio.location}, I'm passionate about building scalable solutions 
                  that make a real impact. My journey in software development has led me to work on 
                  diverse projects ranging from AI-powered healthcare applications to interactive web experiences.
                </p>
              </div>

              {/* Key Info */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                  <p className="text-gray-700">{PORTFOLIO_DATA.bio.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Company</h4>
                  <p className="text-gray-700">{PORTFOLIO_DATA.bio.company}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                  <p className="text-gray-700">{PORTFOLIO_DATA.bio.mission}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <p className="text-gray-700">{PORTFOLIO_DATA.bio.status}</p>
                </div>
              </div>

              {/* Contact Button */}
              <a
                href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">📧</span>
                Let's Connect
              </a>
            </div>

            {/* Highlights & Stats */}
            <div className="space-y-8">
              {/* Highlights */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Key Highlights</h4>
                <div className="space-y-4">
                  {PORTFOLIO_DATA.bio.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-4 flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">6+</div>
                  <div className="text-sm text-gray-600">Years Coding</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">100K+</div>
                  <div className="text-sm text-gray-600">Users Reached</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
                  <div className="text-sm text-gray-600">Technologies</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">4+</div>
                  <div className="text-sm text-gray-600">Major Projects</div>
                </div>
              </div>

              {/* Philosophy */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">My Philosophy</h4>
                <p className="text-gray-700 italic">
                  "Great software isn't just about clean code—it's about solving real problems 
                  and creating meaningful experiences that improve people's lives."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}