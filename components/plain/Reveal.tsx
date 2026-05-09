'use client'

import {
  createElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

type Tag =
  | 'div'
  | 'span'
  | 'section'
  | 'aside'
  | 'article'
  | 'p'
  | 'ul'
  | 'li'
  | 'header'
  | 'footer'
  | 'h1'
  | 'h2'
  | 'h3'

type Props = {
  children: ReactNode
  delay?: 0 | 1 | 2 | 3 | 4 | 5
  as?: Tag
  className?: string
  threshold?: number
}

export default function Reveal({
  children,
  delay = 0,
  as = 'div',
  className = '',
  threshold = 0.18,
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const delayClass = delay ? `reveal-${delay}` : ''
  const visibleClass = visible ? 'is-visible' : ''
  const finalClass = `reveal ${delayClass} ${visibleClass} ${className}`.trim()

  return createElement(as, { ref, className: finalClass }, children)
}
