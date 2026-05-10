export function getModePreference(): 'content' | 'game' {
  if (typeof window === 'undefined') return 'game'
  return (localStorage.getItem('portfolio-mode') as 'content' | 'game') || 'game'
}

export function setModePreference(mode: 'content' | 'game') {
  localStorage.setItem('portfolio-mode', mode)
}