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
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-forest-900 via-sage-800 to-forest-800">
      {/* Cozy Background */}
      <div className="absolute inset-0">
        {/* Paper texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23eb6b3d' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-20 w-60 h-60 bg-coral-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 70, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-sage-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -90, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-32 h-32 bg-cream-500/8 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
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
          {/* Casual intro */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-3 personal-card rounded-2xl px-6 py-4"
          >
            <span className="text-3xl">🌱</span>
            <span className="text-cream-200 font-medium">Hey! I&apos;m just a guy who loves coding</span>
          </motion.div>

          {/* Name - more casual */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            <span className="text-cream-200">I&apos;m </span>
            <span className="gradient-text">Huzaifa</span>
          </motion.h1>

          {/* Simple description instead of typing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-xl md:text-2xl text-sage-300 font-light">
              CS student • Code enthusiast • Problem solver
            </p>
          </motion.div>

          {/* Personal story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg text-sage-200 leading-relaxed mb-6">
              Currently studying Computer Science at UMBC and working part-time at HZSR. 
              I spend way too much time coding, love solving puzzles, and think the best 
              part of programming is when everything finally clicks! ✨
            </p>
            <p className="text-base text-sage-300">
              When I&apos;m not debugging code, you&apos;ll find me experimenting with new tech, 
              playing games, or wondering why my code worked yesterday but not today 🤔
            </p>
          </motion.div>

          {/* Simple navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-wrap justify-center gap-4 text-sm"
          >
            <button
              onClick={() => scrollToSection('projects')}
              className="px-4 py-2 personal-card rounded-lg text-cream-200 hover:text-coral-300 transition-colors duration-200"
            >
              stuff I&apos;ve built 🛠️
            </button>
            <button
              onClick={() => scrollToSection('experience')}
              className="px-4 py-2 personal-card rounded-lg text-cream-200 hover:text-sage-300 transition-colors duration-200"
            >
              my story 📖
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-4 py-2 personal-card rounded-lg text-cream-200 hover:text-cream-300 transition-colors duration-200"
            >
              let&apos;s chat + play games 🎮
            </button>
          </motion.div>

          {/* Fun quick facts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto text-center"
          >
            <div className="personal-card p-3 rounded-xl">
              <div className="text-2xl mb-1">☕</div>
              <div className="text-xs text-sage-300">Coffee powered</div>
            </div>
            <div className="personal-card p-3 rounded-xl">
              <div className="text-2xl mb-1">🌙</div>
              <div className="text-xs text-sage-300">Night coder</div>
            </div>
            <div className="personal-card p-3 rounded-xl">
              <div className="text-2xl mb-1">🐛</div>
              <div className="text-xs text-sage-300">Bug hunter</div>
            </div>
            <div className="personal-card p-3 rounded-xl">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs text-sage-300">Problem solver</div>
            </div>
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