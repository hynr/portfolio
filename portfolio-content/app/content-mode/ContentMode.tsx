import Hero from '@/components/plain/Hero'
import About from '@/components/plain/About'
import Experience from '@/components/plain/Experience'
import Projects from '@/components/plain/Projects'
import Skills from '@/components/plain/Skills'
import Contact from '@/components/plain/Contact'
import '../globals.css'
import '../../styles/content.css'

export default function ContentMode() {
  return (
    <main className="content-mode">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-400 mb-4">
              © {new Date().getFullYear()} Huzaifa Naroo. Built with Next.js, TypeScript, and Tailwind CSS.
            </p>
            <p className="text-sm text-gray-500">
              Designed and developed with ❤️ in Columbia, MD
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}