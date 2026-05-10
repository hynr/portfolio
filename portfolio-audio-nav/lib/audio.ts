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

interface AudioConfig {
  defaultVolume: number
  footstepVolume: number
}

class AudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundEvent, AudioBuffer> = new Map()
  private muted: boolean = false
  private initialized: boolean = false
  private config: AudioConfig = {
    defaultVolume: 0.3,
    footstepVolume: 0.1
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMuteState = localStorage.getItem('audio-muted')
      this.muted = savedMuteState === 'true'
      
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducedMotion) {
        this.muted = true
      }
      
      this.setupAudioContext()
    }
  }

  private setupAudioContext() {
    const initAudio = () => {
      if (!this.initialized && typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        this.initialized = true
        this.preloadSounds()
        
        if (typeof document !== 'undefined') {
          document.removeEventListener('click', initAudio)
          document.removeEventListener('keydown', initAudio)
          document.removeEventListener('touchstart', initAudio)
        }
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('click', initAudio, { once: true })
      document.addEventListener('keydown', initAudio, { once: true })
      document.addEventListener('touchstart', initAudio, { once: true })
    }
  }

  private async preloadSounds() {
    if (!this.audioContext) return

    const soundFiles: Record<SoundEvent, string> = {
      'jump': '/sounds/jump.mp3',
      'land': '/sounds/land.mp3',
      'coin': '/sounds/coin.mp3',
      'block-hit': '/sounds/block-hit.mp3',
      'block-reveal': '/sounds/block-reveal.mp3',
      'footstep': '/sounds/footstep.mp3',
      'pipe-enter': '/sounds/pipe-enter.mp3',
      'enemy-stomp': '/sounds/enemy-stomp.mp3',
      'damage': '/sounds/damage.mp3',
      'die': '/sounds/die.mp3',
      'game-over': '/sounds/game-over.mp3',
      'level-complete': '/sounds/level-complete.mp3',
      'pause': '/sounds/pause.mp3'
    }

    const loadPromises = Object.entries(soundFiles).map(async ([event, path]) => {
      try {
        const response = await fetch(path)
        if (!response.ok) {
          console.warn(`Sound file not found: ${path}`)
          return
        }
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
        this.sounds.set(event as SoundEvent, audioBuffer)
      } catch (error) {
        console.warn(`Failed to load sound: ${event}`, error)
      }
    })

    await Promise.all(loadPromises)
  }

  play(event: SoundEvent) {
    if (this.muted || !this.audioContext || !this.initialized) {
      console.log('[Sound]', event, '(muted or not initialized)')
      return
    }

    const buffer = this.sounds.get(event)
    if (!buffer) {
      console.log('[Sound]', event, '(not loaded)')
      return
    }

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      
      const volume = event === 'footstep' 
        ? this.config.footstepVolume 
        : this.config.defaultVolume
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      source.start(0)
    } catch (error) {
      console.warn('Failed to play sound:', event, error)
    }
  }

  setMuted(isMuted: boolean) {
    this.muted = isMuted
    localStorage.setItem('audio-muted', String(isMuted))
  }

  getMuted(): boolean {
    return this.muted
  }
}

const audioManager = new AudioManager()

export function playSound(event: SoundEvent): void {
  audioManager.play(event)
}

let muted = false

export function setMuted(isMuted: boolean): void {
  muted = isMuted
  audioManager.setMuted(isMuted)
}

export function getMuted(): boolean {
  return audioManager.getMuted()
}

export function playMusic(track: 'main' | 'underground' | 'castle' | 'victory'): void {
  console.log('[Music]', track)
}

export function stopMusic(): void {
  console.log('[Music] stopped')
}