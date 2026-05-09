'use client'

import Reveal from './Reveal'
import CoinDisc from './CoinDisc'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

type AnyProject = (typeof PORTFOLIO_DATA.projects)[number] & {
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
}

const findProject = (id: string): AnyProject =>
  PORTFOLIO_DATA.projects.find((p) => p.id === id) as AnyProject

const therasort = findProject('therasort')
const portfolio = findProject('portfolio-mario')
const pipeline = findProject('data-pipeline')
const dashboard = findProject('react-dashboard')

function TechTags({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
      {items.map((t) => (
        <li key={t} className="tech-tag">{t}</li>
      ))}
    </ul>
  )
}

function ProjectLinks({
  github,
  live,
  demo,
}: {
  github?: string
  live?: string
  demo?: string
}) {
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-2 mt-7">
      {github && (
        <li>
          <a href={github} target="_blank" rel="noopener noreferrer" className="link-wipe link-pipe text-sm">
            GitHub ↗
          </a>
        </li>
      )}
      {live && (
        <li>
          <a href={live} target="_blank" rel="noopener noreferrer" className="link-wipe text-sm">
            Live site ↗
          </a>
        </li>
      )}
      {demo && (
        <li>
          <a href={demo} target="_blank" rel="noopener noreferrer" className="link-wipe link-sky text-sm">
            Watch demo ↗
          </a>
        </li>
      )}
    </ul>
  )
}

function SectionRule() {
  return (
    <div aria-hidden className="mx-auto max-w-[1200px] px-6">
      <div className="h-px bg-rule" />
    </div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="bg-surface">
      {/* Section header */}
      <div className="section-py-tight">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <span className="block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink-soft">
              <span className="inline-block w-8 h-px align-middle bg-rule mr-3" />
              Selected work · 2023 – 2024
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="text-h1 font-medium text-ink mt-6 max-w-[18ch]">
              Four things I built that
              <br />
              made it past the demo.
            </h2>
          </Reveal>
        </div>
      </div>

      <SectionRule />

      {/* MODULE 1 — Therasort: text + pull quote */}
      <article className="proj-module section-py-default">
        <div className="mx-auto max-w-[1200px] px-6 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          <Reveal as="div" className="md:col-span-7">
            <div className="proj-kicker mb-3">
              01 · AI/ML · 2024
            </div>
            <h3 className="text-h2 font-medium text-ink mb-6">
              {therasort.title}
            </h3>
            <p className="text-base leading-relaxed text-ink-soft mb-5 max-w-[60ch]">
              {therasort.longDescription}
            </p>
            <p className="text-base leading-relaxed text-ink-soft max-w-[60ch]">
              The hard part wasn&apos;t the model call. It was teaching the system
              the difference between a clinical observation and a patient quote,
              then making the structured output fast enough that a therapist
              wouldn&apos;t close the tab waiting on it.
            </p>
            <TechTags items={therasort.technologies} />
            <ProjectLinks github={therasort.githubUrl} />
          </Reveal>

          <Reveal as="aside" delay={2} className="md:col-span-5 md:pt-10">
            <blockquote className="relative">
              <span
                aria-hidden
                className="absolute -top-6 -left-2 select-none text-coin-soft"
                style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', lineHeight: 1, fontWeight: 600 }}
              >
                &ldquo;
              </span>
              <p className="relative text-h3 font-medium text-ink leading-snug">
                Reduced note processing time by{' '}
                <span className="text-brick">~70%</span> in pilot.
              </p>
              <footer className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft">
                · earned, not rounded
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </article>

      <SectionRule />

      {/* MODULE 2 — Mario Portfolio: meta, narrower, with pipe */}
      <article className="proj-module section-py-default bg-surface-soft">
        <div className="mx-auto max-w-[820px] px-6">
          <Reveal>
            <div className="proj-kicker mb-3">
              02 · Full Stack · 2024
            </div>
            <h3 className="text-h2 font-medium text-ink mb-6">
              {portfolio.title}
            </h3>
          </Reveal>

          <Reveal delay={1}>
            <p className="text-lede text-ink-soft mb-5">
              You&apos;re looking at it. The recruiter-facing site you&apos;re reading,
              and a fully playable Mario level living one click away. Pipes warp
              to GitHub, LinkedIn, email, and resume; coins are project facts;
              the question blocks contain my actual case studies.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p className="text-base leading-relaxed text-ink-soft max-w-[60ch]">
              Built in three parallel branches with a strict cross-lane contract
              (level data, physics, audio) so the merge would be boring on
              purpose. Next.js 14, TypeScript, Tailwind, Canvas API. Reduced-motion
              users land on this side without ceremony.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <TechTags items={portfolio.technologies} />
            <ProjectLinks github={portfolio.githubUrl} live={portfolio.liveUrl} />
          </Reveal>
        </div>
      </article>

      <SectionRule />

      {/* MODULE 3 — AWS Pipeline: monumental number */}
      <article className="proj-module section-py-default">
        <div className="mx-auto max-w-[1200px] px-6 grid md:grid-cols-12 gap-10 md:gap-14 items-start">
          <Reveal as="div" className="md:col-span-5">
            <div className="proj-kicker mb-3">
              03 · Backend · 2023
            </div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft flex items-center gap-2">
              <CoinDisc size={18} spin />
              Records processed
            </p>
            <p
              className="text-ink leading-none mt-3 font-medium"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 6.5rem)', letterSpacing: '-0.04em' }}
            >
              1<span className="text-ink-soft">,</span>000<span className="text-ink-soft">,</span>000
              <span className="text-coin-deep">+</span>
            </p>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft mt-4">
              per day · 99.9% uptime · 60% cost reduction
            </p>
          </Reveal>

          <Reveal as="div" delay={2} className="md:col-span-7 md:pt-10">
            <h3 className="text-h2 font-medium text-ink mb-6">
              {pipeline.title}
            </h3>
            <p className="text-base leading-relaxed text-ink-soft mb-5 max-w-[60ch]">
              {pipeline.longDescription}
            </p>
            <p className="text-base leading-relaxed text-ink-soft max-w-[60ch]">
              Lambda concurrency, S3 partitioning by ingestion hour, DynamoDB
              for hot lookups, idempotent retries with poison-queue routing. The
              whole thing pages me only when something is actually broken; which,
              when you&apos;re paying per invocation, matters.
            </p>
            <TechTags items={pipeline.technologies} />
          </Reveal>
        </div>
      </article>

      <SectionRule />

      {/* MODULE 4 — Analytics Dashboard: SVG sparkline + text */}
      <article className="proj-module section-py-default">
        <div className="mx-auto max-w-[1200px] px-6 grid md:grid-cols-12 gap-10 md:gap-14 items-end">
          <Reveal as="div" className="md:col-span-6">
            <div className="rounded-sm border border-rule bg-surface-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft">
                  events / second
                </span>
                <span className="font-mono text-[0.72rem] text-pipe-deep">▲ 12.4%</span>
              </div>
              {/* Editorial sparkline — drawn semantically, not decorative */}
              <svg
                viewBox="0 0 320 120"
                className="w-full h-32"
                role="img"
                aria-label="Sample real-time chart sparkline"
              >
                <defs>
                  <linearGradient id="dash-fade" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--sky)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 90 L 30 70 L 60 78 L 90 50 L 120 60 L 150 32 L 180 48 L 210 28 L 240 38 L 270 16 L 300 24 L 320 8"
                  fill="none"
                  stroke="var(--sky-deep)"
                  strokeWidth="1.5"
                />
                <path
                  d="M 0 90 L 30 70 L 60 78 L 90 50 L 120 60 L 150 32 L 180 48 L 210 28 L 240 38 L 270 16 L 300 24 L 320 8 L 320 120 L 0 120 Z"
                  fill="url(#dash-fade)"
                />
                {/* Tick markers */}
                {[0, 80, 160, 240, 320].map((x) => (
                  <line key={x} x1={x} y1="115" x2={x} y2="120" stroke="var(--rule)" />
                ))}
              </svg>
              <div className="flex items-center justify-between mt-4 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-mute">
                <span>09:00</span>
                <span>10:00</span>
                <span>11:00</span>
                <span>12:00</span>
                <span>now</span>
              </div>
            </div>
          </Reveal>

          <Reveal as="div" delay={2} className="md:col-span-6">
            <div className="proj-kicker mb-3">
              04 · Frontend · 2023
            </div>
            <h3 className="text-h2 font-medium text-ink mb-6">
              {dashboard.title}
            </h3>
            <p className="text-base leading-relaxed text-ink-soft mb-5 max-w-[60ch]">
              Fifty-plus interactive charts, sub-100ms render times, WebSocket
              streams keeping the data honest. The brief was &ldquo;dashboard.&rdquo; The
              hard part was making the charts re-renderable without thrashing
              the React tree, and making them composable enough that the team
              could add a new metric without my involvement.
            </p>
            <TechTags items={dashboard.technologies} />
          </Reveal>
        </div>
      </article>
    </section>
  )
}

