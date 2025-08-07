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
      {/* Warm Personal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-warm-900/20">
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #ee7420 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        {/* Warm floating elements */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-warm-500/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
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
          {/* Personal intro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-warm-900/20 backdrop-blur-sm rounded-full px-6 py-3 border border-primary-500/30"
          >
            <span className="text-2xl">👋</span>
            <span className="text-primary-300 text-sm">Hey there! Welcome to my space</span>
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
            A curious soul who finds joy in turning ideas into reality through code. 
            Currently juggling his CS studies at UMBC with his role at HZSR, where he&apos;s 
            been part of optimizing systems that touch 100K+ lives. Outside of work, 
            he&apos;s probably tinkering with{' '}
            <span className="text-primary-400 font-semibold">backend magic</span>,{' '}
            <span className="text-secondary-400 font-semibold">cloud adventures</span>, or{' '}
            <span className="text-warm-400 font-semibold">AI experiments</span>.
          </motion.p>

          {/* Personal highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-warm-900/10 backdrop-blur-sm rounded-xl p-5 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300">
              <div className="text-xl mb-2">💼</div>
              <div className="text-lg font-semibold text-primary-300 mb-1">Day Job</div>
              <div className="text-gray-300 text-sm">Software Engineer @ HZSR</div>
              <div className="text-gray-500 text-xs mt-1">Making real estate data magic happen</div>
            </div>
            <div className="bg-warm-900/10 backdrop-blur-sm rounded-xl p-5 border border-secondary-500/20 hover:border-secondary-500/40 transition-all duration-300">
              <div className="text-xl mb-2">🎓</div>
              <div className="text-lg font-semibold text-secondary-300 mb-1">Learning</div>
              <div className="text-gray-300 text-sm">UMBC Computer Science</div>
              <div className="text-gray-500 text-xs mt-1">Statistics on the side</div>
            </div>
            <div className="bg-warm-900/10 backdrop-blur-sm rounded-xl p-5 border border-warm-500/20 hover:border-warm-500/40 transition-all duration-300">
              <div className="text-xl mb-2">🚀</div>
              <div className="text-lg font-semibold text-warm-300 mb-1">Passion</div>
              <div className="text-gray-300 text-sm">Backend + Cloud + AI</div>
              <div className="text-gray-500 text-xs mt-1">One commit at a time</div>
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
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary-500/30 warm-glow"
            >
              🔍 Check Out His Projects
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="px-8 py-3 border-2 border-secondary-500/50 hover:border-secondary-400 text-gray-300 hover:text-secondary-300 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-secondary-900/20 hover:bg-secondary-900/30"
            >
              ⚡ Explore His Toolkit
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