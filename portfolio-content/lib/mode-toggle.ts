export function getModePreference(): 'content' | 'game' {
  if (typeof window === 'undefined') return 'content'
  return (localStorage.getItem('portfolio-mode') as 'content' | 'game') || 'content'
}

export function setModePreference(mode: 'content' | 'game') {
  localStorage.setItem('portfolio-mode', mode)
}