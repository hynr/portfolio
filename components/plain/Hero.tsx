'use client'

import Reveal from './Reveal'
import Cloud from './Cloud'
import GroundBand from './GroundBand'

export default function Hero({ onSwitchMode }: { onSwitchMode: () => void }) {
  return (
    <section
      id="hero"
      className="section-py-hero relative bg-surface overflow-hidden"
    >
      {/* Ambient clouds — quiet sky cue, drift slowly. Hidden on mobile to
          avoid crowding the type. */}
      <div
        aria-hidden
        className="hidden md:block absolute top-20 right-12 anim-cloud-drift opacity-90 pointer-events-none"
      >
        <Cloud size={88} />
      </div>
      <div
        aria-hidden
        className="hidden md:block absolute top-44 right-[28%] anim-cloud-drift-slow opacity-70 pointer-events-none"
      >
        <Cloud size={56} />
      </div>

      {/* Quiet rule + monogram in the upper margin */}
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <span className="block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink-soft mb-8">
            <span className="inline-block w-8 h-px align-middle bg-rule mr-3" />
            Engineer · Columbia, MD · est. HZSR
          </span>
        </Reveal>

        <div className="max-w-[18ch]">
          <Reveal delay={1}>
            <h1 className="text-display font-medium text-ink">
              Huzaifa
              <br />
              Naroo
              <span className="text-brick">.</span>
            </h1>
          </Reveal>
        </div>

        <div className="mt-12 max-w-[58ch]">
          <Reveal delay={2}>
            <p className="text-lede text-ink-soft">
              Six years writing software at the seam of AI and product. I&apos;ve built
              clinical AI for therapy practices, a real-time analytics dashboard,
              serverless pipelines that quietly process a million records a day,
              and{' '}
              <button
                onClick={onSwitchMode}
                className="link-wipe link-pipe font-medium"
              >the Mario level you can play one tab over</button>: the kind of
              work that adds up to roughly 100K people using something I made.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-20">
          <Reveal delay={3}>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              <a href="#projects" className="link-wipe link-pipe text-base font-medium">
                See the work&nbsp;↓
              </a>
              <a href="#contact" className="link-wipe text-base font-medium">
                Get in touch
              </a>
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-mute hidden md:inline">
                Press <kbd className="px-1.5 py-0.5 mx-1 border border-rule rounded text-ink-soft">Tab</kbd> to walk the page
              </span>
            </div>
          </Reveal>
        </div>
      </div>

    </section>
  )
}
