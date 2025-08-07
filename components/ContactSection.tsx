'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Github, Linkedin, CheckCircle, AlertCircle } from 'lucide-react'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

const ContactSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<FormStatus>({ type: 'idle', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: 'loading', message: 'Sending message...' })

    // Simulate form submission (replace with actual form handler)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStatus({ type: 'success', message: 'Message sent successfully! I\'ll get back to you soon.' })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again.' })
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'huzaifanaroo1@gmail.com',
      href: 'mailto:huzaifanaroo1@gmail.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '443-883-5520',
      href: 'tel:443-883-5520'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Columbia, MD',
      href: 'https://maps.google.com/?q=Columbia,MD'
    }
  ]

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/hynr',
      color: 'hover:text-gray-300'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/huzaifa-naroo',
      color: 'hover:text-blue-400'
    }
  ]

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Let&apos;s Chat</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Whether you want to discuss a cool project, talk tech, or explore opportunities together - 
            I&apos;d love to connect! Drop me a message and let&apos;s see what we can build.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                I&apos;m always open to discussing new opportunities, interesting projects, 
                or potential collaborations. Whether you&apos;re a recruiter looking for talent 
                or a fellow developer wanting to connect, feel free to reach out!
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-center space-x-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all duration-300 group"
                >
                  <div className="p-3 bg-primary-500/20 rounded-lg group-hover:bg-primary-500/30 transition-colors duration-300">
                    <item.icon size={24} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Follow Me</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className={`p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all duration-300 text-gray-400 ${social.color}`}
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mt-8"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">24h</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">100%</div>
                  <div className="text-sm text-gray-400">Project Success</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 resize-none"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>

              {/* Status Message */}
              {status.type !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border flex items-center space-x-3 ${
                    status.type === 'success'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : status.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                  }`}
                >
                  {status.type === 'success' && <CheckCircle size={20} />}
                  {status.type === 'error' && <AlertCircle size={20} />}
                  {status.type === 'loading' && (
                    <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  <p className="text-sm">{status.message}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={status.type === 'loading'}
                whileHover={{ scale: status.type === 'loading' ? 1 : 1.02 }}
                whileTap={{ scale: status.type === 'loading' ? 1 : 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  status.type === 'loading'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-primary-500/25'
                } text-white`}
              >
                {status.type === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection