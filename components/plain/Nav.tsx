'use client'

import { useEffect, useState } from 'react'
import PipeWarp from './PipeWarp'

type Props = {
  onSwitchMode: () => void
}

const sections = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav({ onSwitchMode }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ease-out-quart ${
        scrolled
          ? 'bg-surface/85 backdrop-blur-sm border-b border-rule'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:py-5">
        <a
          href="#top"
          className="flex items-baseline gap-2 text-ink no-underline hover:text-brick-deep transition-colors duration-200"
        >
          <span className="text-base font-semibold tracking-tight">Huzaifa Naroo</span>
          <span className="hidden sm:inline font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
            engineer
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-7">
          {sections.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-ink-soft hover:text-ink transition-colors duration-200"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <PipeWarp onSwitch={onSwitchMode} className="hidden sm:inline-flex" />

        <button
          type="button"
          onClick={onSwitchMode}
          className="sm:hidden font-mono text-[0.72rem] uppercase tracking-[0.12em] text-pipe-deep"
          aria-label="Switch to game mode"
        >
          Game →
        </button>
      </nav>
    </header>
  )
}
