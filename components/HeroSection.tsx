'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ChevronDown, Code, Terminal, Zap, GamepadIcon } from 'lucide-react'

const HeroSection = () => {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const roles = [
      'Code Wizard',
      'Bug Slayer',
      'System Builder', 
      'Problem Solver'
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
      {/* Animated cyber background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating neon orbs */}
        <motion.div
          className="absolute top-20 left-20 w-80 h-80 bg-neon-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -120, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          {/* Cyber greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center space-x-3 cyber-card rounded-2xl px-8 py-4 neon-glow"
          >
            <Terminal className="text-neon-400" size={24} />
            <span className="text-neon-300 font-mono text-lg">system.boot()</span>
            <div className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Name with glitch effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 glitch" data-text="HUZAIFA">
              <span className="gradient-text">HUZAIFA</span>
            </h1>
            <div className="text-2xl md:text-3xl font-light text-gray-400">
              <Code className="inline mr-2" size={28} />
              {text}
              <span className="animate-pulse text-neon-400 ml-1">|</span>
            </div>
          </motion.div>

          {/* Status display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="cyber-card rounded-xl p-6 font-mono text-left">
              <div className="text-neon-400 text-sm mb-3">// Current Status</div>
              <div className="text-gray-300 space-y-2">
                <div>📍 Location: UMBC Campus</div>
                <div>💼 Role: Software Engineer @ HZSR</div>
                <div>🎯 Mission: Building systems that serve 100K+ users</div>
                <div>⚡ Expertise: Python | React | AWS | AI/ML</div>
                <div className="text-neon-400">🚀 Status: Always learning, always building</div>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <button
              onClick={() => scrollToSection('projects')}
              className="group relative px-8 py-4 bg-gradient-to-r from-neon-500 to-electric-500 text-dark-50 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 neon-glow overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="relative z-10 flex items-center">
                <Zap size={20} className="mr-2" />
                VIEW PROJECTS
              </span>
            </button>
            
            <button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 border-2 border-purple-500 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-purple-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <span className="relative z-10 flex items-center">
                <GamepadIcon size={20} className="mr-2" />
                PLAY GAMES
              </span>
            </button>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex justify-center space-x-8"
          >
            {[
              { icon: Github, href: 'https://github.com/hynr', color: 'hover:text-neon-400' },
              { icon: Linkedin, href: 'https://linkedin.com/in/huzaifa-naroo', color: 'hover:text-electric-400' },
              { icon: Mail, href: 'mailto:huzaifanaroo1@gmail.com', color: 'hover:text-purple-400' }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className={`text-gray-400 ${social.color} transition-all duration-300`}
              >
                <social.icon size={28} />
              </motion.a>
            ))}
          </motion.div>

          {/* Stats display */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-16"
          >
            <div className="cyber-card p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-neon-400 mb-1">100K+</div>
              <div className="text-xs text-gray-400">Users Reached</div>
            </div>
            <div className="cyber-card p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-electric-400 mb-1">3+</div>
              <div className="text-xs text-gray-400">Years Coding</div>
            </div>
            <div className="cyber-card p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">∞</div>
              <div className="text-xs text-gray-400">Problems Solved</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
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
            <ChevronDown size={32} className="text-neon-400 hover:text-neon-300 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection