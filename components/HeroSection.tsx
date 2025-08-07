'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ChevronDown, Code, Terminal } from 'lucide-react'

const HeroSection = () => {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const roles = [
      'Full Stack Engineer',
      'Backend Architect',
      'Cloud Engineer',
      'AI/ML Developer'
    ]
    const handleType = () => {
      const i = loopNum % roles.length
      const fullText = roles[i]

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      )

      setTypingSpeed(isDeleting ? 30 : 150)

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1000)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, typingSpeed])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23374151%22%20stroke-width%3D%220.5%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%20/%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Terminal-style intro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700"
          >
            <Terminal size={16} className="text-green-400" />
            <span className="text-green-400 font-mono text-sm">~/portfolio $</span>
            <span className="text-gray-300 font-mono text-sm">whoami</span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold"
          >
            <span className="gradient-text">Huzaifa</span>{' '}
            <span className="text-white">Naroo</span>
          </motion.h1>

          {/* Typing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="h-16 flex items-center justify-center"
          >
            <h2 className="text-2xl md:text-4xl font-light text-gray-300">
              <Code className="inline mr-2" size={32} />
              {text}
              <span className="animate-pulse text-primary-400">|</span>
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            I&apos;m passionate about building scalable solutions that make a real impact. 
            Currently pursuing my CS degree at UMBC while working at HZSR, where I&apos;ve helped 
            optimize systems serving 100K+ users. I love tackling complex challenges in{' '}
            <span className="text-primary-400 font-semibold">backend engineering</span>,{' '}
            <span className="text-primary-400 font-semibold">cloud infrastructure</span>, and{' '}
            <span className="text-primary-400 font-semibold">AI/ML</span>.
          </motion.p>

          {/* Personal highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">Current Role</div>
              <div className="text-gray-300 text-sm">Software Engineer at HZSR</div>
              <div className="text-gray-500 text-xs mt-1">Building real estate data platforms</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">Education</div>
              <div className="text-gray-300 text-sm">UMBC Computer Science</div>
              <div className="text-gray-500 text-xs mt-1">Minor in Statistics</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">Focus Areas</div>
              <div className="text-gray-300 text-sm">Backend + Cloud + AI/ML</div>
              <div className="text-gray-500 text-xs mt-1">Building the future, one line at a time</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => scrollToSection('projects')}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-primary-500/25"
            >
              Check Out My Projects
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-3 border border-gray-600 hover:border-primary-400 text-gray-300 hover:text-primary-400 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Get In Touch
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex justify-center space-x-6"
          >
            <motion.a
              href="https://github.com/hynr"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, color: '#3b82f6' }}
              className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
            >
              <Github size={24} />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/huzaifa-naroo"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, color: '#3b82f6' }}
              className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
            >
              <Linkedin size={24} />
            </motion.a>
            <motion.a
              href="mailto:huzaifanaroo1@gmail.com"
              whileHover={{ scale: 1.1, color: '#3b82f6' }}
              className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
            >
              <Mail size={24} />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="cursor-pointer"
            onClick={() => scrollToSection('experience')}
          >
            <ChevronDown size={32} className="text-gray-400 hover:text-primary-400 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection