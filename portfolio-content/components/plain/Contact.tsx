'use client'

import { useState } from 'react'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const mailtoLink = `mailto:${PORTFOLIO_DATA.bio.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`
    
    window.location.href = mailtoLink
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section id="contact" className="section-spacing bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Let's Work Together
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Have an exciting project in mind? I'd love to help bring your ideas to life. 
              Let's discuss how we can work together to create something amazing.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
                <p className="text-gray-700 leading-relaxed mb-8">
                  I'm always open to discussing new opportunities, interesting projects, 
                  or just having a chat about technology and development. Feel free to reach out!
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <a 
                      href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {PORTFOLIO_DATA.bio.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-700">{PORTFOLIO_DATA.bio.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">💼</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Availability</h4>
                    <p className="text-gray-700">Open for new opportunities</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Connect With Me</h4>
                <div className="flex gap-4">
                  {PORTFOLIO_DATA.links.map((link) => (
                    <a
                      key={link.type}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
                      aria-label={`Visit my ${link.label}`}
                    >
                      {link.type === 'github' && '📁'}
                      {link.type === 'linkedin' && '💼'}
                      {link.type === 'email' && '📧'}
                      {link.type === 'website' && '🌐'}
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <h4 className="font-semibold text-green-800">Currently Available</h4>
                </div>
                <p className="text-green-700 text-sm">
                  I'm actively looking for new opportunities and exciting projects. 
                  Let's connect and see if we're a good fit!
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="Project Collaboration">Project Collaboration</option>
                      <option value="Job Opportunity">Job Opportunity</option>
                      <option value="Freelance Work">Freelance Work</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
                      placeholder="Tell me about your project or how I can help..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Send Message
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    This form will open your email client with a pre-filled message.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✉️</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Ready!</h4>
                  <p className="text-gray-700 mb-6">
                    Your email client should have opened with a pre-filled message. 
                    If it didn't, you can reach me directly at:
                  </p>
                  <a 
                    href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {PORTFOLIO_DATA.bio.email}
                  </a>
                  <br />
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Something Great?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Whether you have a fully formed project idea or just want to explore possibilities, 
              I'd love to hear from you. Let's turn your vision into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Start a Conversation
              </a>
              <a
                href="#projects"
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                View My Work First
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}