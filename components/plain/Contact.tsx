'use client'

import { useState } from 'react'
import Reveal from './Reveal'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'
import { playSound } from '@/lib/audio'

type FormState = {
  name: string
  email: string
  message: string
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [oneUpKey, setOneUpKey] = useState(0)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Trigger the 1UP coin float
    setOneUpKey((k) => k + 1)
    try {
      playSound('coin')
    } catch {}

    // Open the user's email client with the prefilled message
    const subject = `Reaching out · ${form.name}`
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    const mailto = `mailto:${PORTFOLIO_DATA.bio.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`

    window.setTimeout(() => {
      window.location.href = mailto
      setSent(true)
    }, 350)
  }

  return (
    <section id="contact" className="bg-surface">
      <div className="section-py-loose">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <span className="block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-ink-soft">
              <span className="inline-block w-8 h-px align-middle bg-rule mr-3" />
              Reach out
            </span>
          </Reveal>

          <Reveal delay={1}>
            <h2 className="text-h1 font-medium text-ink mt-6 max-w-[20ch]">
              If you&apos;re hiring,
              <br />
              I&apos;d like to hear about it.
            </h2>
          </Reveal>

          <div className="mt-16 md:mt-20 grid md:grid-cols-12 gap-12 md:gap-16">
            {/* Direct paths */}
            <Reveal as="div" delay={1} className="md:col-span-5">
              <p className="text-base leading-relaxed text-ink-soft mb-10 max-w-[40ch]">
                The quickest paths are direct. I read every email and reply within
                a day, often within the hour.
              </p>

              <ul className="space-y-7">
                <li>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                    className="link-wipe text-lg text-ink"
                  >
                    {PORTFOLIO_DATA.bio.email}
                  </a>
                </li>
                <li>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft mb-1">
                    GitHub
                  </p>
                  <a
                    href="https://github.com/hynr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-wipe link-pipe text-lg"
                  >
                    github.com/hynr
                  </a>
                </li>
                <li>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft mb-1">
                    LinkedIn
                  </p>
                  <a
                    href="https://linkedin.com/in/huzaifa-naroo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-wipe link-sky text-lg"
                  >
                    linkedin.com/in/huzaifa-naroo
                  </a>
                </li>
                <li>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft mb-1">
                    Based in
                  </p>
                  <p className="text-lg text-ink">Columbia, MD · open to remote</p>
                </li>
              </ul>
            </Reveal>

            {/* Form */}
            <Reveal as="div" delay={2} className="md:col-span-7">
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <label className="field-label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="field-input"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="field-input"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="field-textarea"
                      placeholder="What are you working on?"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <button
                      type="submit"
                      className="relative inline-flex items-center gap-3 px-7 py-3 bg-pipe text-white font-medium rounded-sm hover:bg-pipe-deep transition-colors duration-200 ease-out-quart"
                    >
                      Send it
                      <span aria-hidden>→</span>

                      {/* 1UP coin float — keyed so each submit re-triggers */}
                      {oneUpKey > 0 && (
                        <span
                          key={oneUpKey}
                          aria-hidden
                          className="anim-oneup absolute -top-2 right-2 font-mono text-sm font-bold text-coin-deep pointer-events-none"
                        >
                          +1&nbsp;★
                        </span>
                      )}
                    </button>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-mute">
                      Opens your mail client with the message prefilled.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="border border-rule bg-surface-soft p-8 rounded-sm">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-pipe-deep mb-3">
                    +1 · message ready
                  </p>
                  <h3 className="text-h2 font-medium text-ink mb-3">
                    Your mail client should be open.
                  </h3>
                  <p className="text-base text-ink-soft mb-6">
                    If it didn&apos;t open, send it directly:
                  </p>
                  <a
                    href={`mailto:${PORTFOLIO_DATA.bio.email}`}
                    className="link-wipe text-lg"
                  >
                    {PORTFOLIO_DATA.bio.email}
                  </a>
                  <button
                    onClick={() => setSent(false)}
                    className="block mt-6 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-soft hover:text-brick transition-colors"
                  >
                    Write another →
                  </button>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
