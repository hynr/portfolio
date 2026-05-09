import Hero from '@/components/plain/Hero'
import Projects from '@/components/plain/Projects'
import Experience from '@/components/plain/Experience'
import Skills from '@/components/plain/Skills'
import Contact from '@/components/plain/Contact'
import Nav from '@/components/plain/Nav'
import GroundBand from '@/components/plain/GroundBand'
import '../globals.css'
import '../../styles/content.css'

type Props = {
  onSwitchMode: () => void
}

export default function ContentMode({ onSwitchMode }: Props) {
  return (
    <div id="top" className="content-mode bg-surface min-h-screen text-ink">
      <Nav onSwitchMode={onSwitchMode} />

      <main>
        <Hero onSwitchMode={onSwitchMode} />
        <GroundBand height={20} />
        <Projects />
        <GroundBand height={20} />
        <Experience />
        <GroundBand height={20} />
        <Skills />
        <GroundBand height={20} />
        <Contact />
      </main>

      <footer className="bg-surface">
        <GroundBand height={24} />
        <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-ink-soft">
            © {new Date().getFullYear()} Huzaifa Naroo · Columbia, MD
          </p>
          <p className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-ink-mute">
            Built with Next.js · The Mario mode is not a metaphor
          </p>
        </div>
      </footer>
    </div>
  )
}
