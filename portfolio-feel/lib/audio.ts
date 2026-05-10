export type SoundEvent = 
  | 'jump'
  | 'land'
  | 'coin'
  | 'block-hit'
  | 'block-reveal'
  | 'footstep'
  | 'pipe-enter'
  | 'enemy-stomp'
  | 'damage'
  | 'die'
  | 'game-over'
  | 'level-complete'
  | 'pause'

export function playSound(event: SoundEvent): void {
  console.log('[Sound]', event)
}

let muted = false

export function setMuted(isMuted: boolean): void {
  muted = isMuted
}

export function getMuted(): boolean {
  return muted
}

export function playMusic(track: 'main' | 'underground' | 'castle' | 'victory'): void {
  console.log('[Music]', track)
}

export function stopMusic(): void {
  console.log('[Music] stopped')
}