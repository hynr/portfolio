import { playSound } from './audio'
import { trackEvent } from './analytics'

export type PipeLink = 'github' | 'linkedin' | 'email' | 'resume'

interface NavigationConfig {
  github: string
  linkedin: string
  email: string
  resume: string
}

const navigationConfig: NavigationConfig = {
  github: 'https://github.com/hynr',
  linkedin: 'https://linkedin.com/in/huzaifa-naroo',
  email: 'mailto:huzaifa478@gmail.com',
  resume: '/resume.pdf'
}

export function handlePipeClick(linkTo: PipeLink): void {
  playSound('pipe-enter')
  trackEvent('pipe_click', { linkTo })

  const url = navigationConfig[linkTo]

  if (!url) {
    console.warn(`Unknown pipe link: ${linkTo}`)
    return
  }
  
  setTimeout(() => {
    switch(linkTo) {
      case 'email':
        window.location.href = url
        break
      case 'resume':
        const resumeWindow = window.open(url, '_blank')
        if (resumeWindow) {
          resumeWindow.focus()
        }
        break
      case 'github':
      case 'linkedin':
      default:
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) {
          newWindow.focus()
        }
        break
    }
  }, 200)
}

export function getPipeLinkLabel(linkTo: PipeLink): string {
  const labels: Record<PipeLink, string> = {
    github: 'View GitHub Profile',
    linkedin: 'Connect on LinkedIn',
    email: 'Send Email',
    resume: 'View Resume PDF'
  }
  
  return labels[linkTo] || 'Navigate to link'
}

export function isPipeClickable(linkTo?: string): boolean {
  return Boolean(linkTo && linkTo in navigationConfig)
}