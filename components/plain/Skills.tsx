'use client'

import Reveal from './Reveal'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

const CATEGORY_ORDER = ['Languages', 'Frameworks', 'Cloud & DevOps', 'Data & AI'] as const

export default function Skills() {
  const grouped = CATEGORY_ORDER.map((c) => ({
    category: c,
    skills: PORTFOLIO_DATA.skills.filter((s) => s.category === c),
  }))

  return (
    <section id="skills" className="bg-surface-soft">
      <div className="section-py-default">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <span className="block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink-soft">
              <span className="inline-block w-8 h-px align-middle bg-rule mr-3" />
              Stack
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="text-h1 font-medium text-ink mt-6 max-w-[18ch]">
              The tools, in the rough order I reach for them.
            </h2>
          </Reveal>

          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {grouped.map((group, gi) => (
              <Reveal key={group.category} delay={(gi % 4) as 0 | 1 | 2 | 3}>
                <div>
                  <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-brick pb-3 mb-5 border-b border-rule">
                    {group.category}
                  </h3>
                  <ul className="space-y-4">
                    {group.skills.map((s) => (
                      <li key={s.name}>
                        <p className="text-ink font-medium leading-tight">{s.name}</p>
                        <p className="font-mono text-[0.72rem] text-ink-mute mt-1">
                          {s.experience}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={3}>
            <p className="mt-16 md:mt-20 max-w-[60ch] text-base text-ink-soft">
              I&apos;m primarily a Python and TypeScript engineer with strong
              opinions about ergonomics. I move toward whichever tool keeps the
              feedback loop short. That&apos;s usually FastAPI on the back, React
              on the front, AWS underneath, and an LLM call where it earns its
              latency.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
