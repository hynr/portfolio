'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Github, Linkedin, Coffee, GamepadIcon, RotateCcw, Trophy } from 'lucide-react'

const ContactSection = () => {
  const [flipped, setFlipped] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [clicks, setClicks] = useState(0)
  const [gameActive, setGameActive] = useState(false)

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'huzaifanaroo1@gmail.com',
      href: 'mailto:huzaifanaroo1@gmail.com',
      color: 'text-blue-400'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '443-883-5520',
      href: 'tel:443-883-5520',
      color: 'text-green-400'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Columbia, MD',
      href: 'https://maps.google.com/?q=Columbia,MD',
      color: 'text-red-400'
    }
  ]

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/hynr',
      color: 'hover:text-gray-300',
      username: '@hynr'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/huzaifa-naroo',
      color: 'hover:text-blue-400',
      username: 'huzaifa-naroo'
    }
  ]

  const startGame = () => {
    setGameActive(true)
    setGameScore(0)
    setClicks(0)
    setTimeout(() => setGameActive(false), 10000) // 10 second game
  }

  const handleClick = () => {
    if (gameActive) {
      setClicks(clicks + 1)
      setGameScore(gameScore + Math.floor(Math.random() * 100))
    }
  }

  return (
    <section id="contact" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Get In Touch</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Always open to interesting conversations about tech, projects, or opportunities.
            Feel free to reach out through any of these channels!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Flip Card */}
            <div className="relative h-64 [perspective:1000px]">
              <motion.div
                className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
                  flipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                {/* Front of card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 flex flex-col justify-center">
                  <div className="text-center">
                    <Coffee size={48} className="text-primary-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Huzaifa Naroo</h3>
                    <p className="text-gray-400 mb-4">Full Stack Engineer</p>
                    <button
                      onClick={() => setFlipped(!flipped)}
                      className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      Flip for Details
                    </button>
                  </div>
                </div>

                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-primary-900 to-gray-900 rounded-xl border border-primary-700 p-6">
                  <div className="space-y-4 h-full flex flex-col justify-center">
                    {contactInfo.map((item, index) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center space-x-3 text-white hover:text-primary-300 transition-colors"
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <item.icon size={20} className={item.color} />
                        <span className="text-sm">{item.value}</span>
                      </motion.a>
                    ))}
                    <button
                      onClick={() => setFlipped(!flipped)}
                      className="mt-4 text-primary-300 text-sm hover:text-primary-200 transition-colors"
                    >
                      ← Flip back
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Find Him Online</h4>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className={`flex items-center space-x-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all duration-300 text-gray-400 ${social.color}`}
                >
                  <social.icon size={24} />
                  <div>
                    <div className="font-medium text-white">{social.label}</div>
                    <div className="text-sm text-gray-400">{social.username}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Fun Mini Game */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700"
          >
            <div className="text-center mb-6">
              <GamepadIcon size={48} className="text-primary-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Click Challenge</h3>
              <p className="text-gray-400 text-sm">
                Think you&apos;re fast? Test your clicking speed in 10 seconds!
              </p>
            </div>

            {!gameActive ? (
              <div className="text-center space-y-4">
                {gameScore > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary-500/20 border border-primary-500/30 rounded-lg p-4 mb-4"
                  >
                    <Trophy size={24} className="text-primary-400 mx-auto mb-2" />
                    <div className="text-white font-bold">Final Score: {gameScore}</div>
                    <div className="text-gray-400 text-sm">{clicks} clicks in 10 seconds</div>
                  </motion.div>
                )}
                <button
                  onClick={startGame}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  {gameScore > 0 ? 'Play Again' : 'Start Game'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary-400">Score: {gameScore}</div>
                <div className="text-gray-400">Clicks: {clicks}</div>
                <motion.button
                  onClick={handleClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-8 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-lg font-bold text-xl transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
                >
                  CLICK ME!
                </motion.button>
                <div className="text-sm text-gray-500">Keep clicking as fast as you can!</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Fun Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">☕</div>
              <div className="text-gray-300 text-sm">Coffee Driven</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">🌙</div>
              <div className="text-gray-300 text-sm">Night Owl Coder</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">🚀</div>
              <div className="text-gray-300 text-sm">Always Shipping</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl font-bold text-primary-400 mb-1">📚</div>
              <div className="text-gray-300 text-sm">Lifelong Learner</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection