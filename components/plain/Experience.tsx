'use client'

import Reveal from './Reveal'
import QuestionBlock from './QuestionBlock'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

export default function Experience() {
  return (
    <section id="experience" className="bg-surface">
      <div className="section-py-default">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <span className="block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink-soft">
              <span className="inline-block w-8 h-px align-middle bg-rule mr-3" />
              Experience
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="text-h1 font-medium text-ink mt-6 max-w-[20ch]">
              Where the years went.
            </h2>
          </Reveal>

          <ol className="mt-16 md:mt-20 space-y-16 md:space-y-24">
            {PORTFOLIO_DATA.experience.map((exp, i) => (
              <li key={exp.id}>
                <Reveal delay={1}>
                  <div className="grid md:grid-cols-12 gap-6 md:gap-12 items-start">
                    {/* Duration column */}
                    <div className="md:col-span-3">
                      <p className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-brick">
                        {exp.duration}
                      </p>
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-mute mt-2">
                        {exp.location}
                      </p>
                    </div>

                    {/* Body column */}
                    <div className="md:col-span-9 max-w-[60ch]">
                      <h3 className="text-h2 font-medium text-ink mb-1">
                        {exp.role}
                      </h3>
                      <p className="text-lede text-ink-soft mb-6">
                        {exp.company}
                      </p>
                      <p className="text-base leading-relaxed text-ink-soft mb-6">
                        {exp.description}
                      </p>

                      <ul className="space-y-4 mb-7">
                        {exp.achievements.map((a, idx) => (
                          <li key={idx} className="flex gap-4 items-start text-base text-ink-soft">
                            <span aria-hidden className="shrink-0 mt-0.5">
                              <QuestionBlock size={22} />
                            </span>
                            <span className="font-mono text-[0.72rem] text-ink-mute pt-1 select-none w-6 shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="pt-0.5">{a}</span>
                          </li>
                        ))}
                      </ul>

                      <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        {exp.technologies.map((t) => (
                          <li key={t} className="tech-tag">{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>

                {/* Inter-entry rule, except after the last */}
                {i < PORTFOLIO_DATA.experience.length - 1 && (
                  <div aria-hidden className="mt-16 md:mt-20 h-px bg-rule" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
