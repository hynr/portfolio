'use client'

import { useState, useEffect } from 'react'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Hero() {
  const [displayedText, setDisplayedText] = useState('')
  const fullText = PORTFOLIO_DATA.bio.title
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, fullText])

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {PORTFOLIO_DATA.bio.name}
            </span>
          </h1>
          
          <div className="text-2xl md:text-4xl font-light mb-6 h-12 flex items-center justify-center">
            <span className="mr-2">I'm a</span>
            <span className="text-blue-400 font-semibold">
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {PORTFOLIO_DATA.bio.summary}
          </p>
        </div>

        {/* Status and Mission */}
        <div className="mb-8">
          <p className="text-lg text-purple-300 mb-2">{PORTFOLIO_DATA.bio.mission}</p>
          <p className="text-gray-400">{PORTFOLIO_DATA.bio.status}</p>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {PORTFOLIO_DATA.bio.highlights.map((highlight, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
            >
              <span className="text-sm font-medium">{highlight}</span>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-12">
          {PORTFOLIO_DATA.links.map((link) => (
            <a
              key={link.type}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
              aria-label={`Visit my ${link.label}`}
            >
              {link.type === 'github' && '📁'}
              {link.type === 'linkedin' && '💼'}
              {link.type === 'email' && '📧'}
              {link.type === 'website' && '🌐'}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#projects"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}