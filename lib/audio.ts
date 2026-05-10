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

// Per-event lazy decode. The map stores either:
//   - undefined: never requested, no fetch in flight
//   - Promise<AudioBuffer | null>: fetch+decode in flight
//   - AudioBuffer: ready to play
// First call for an unfetched event drops (decode is async) and starts the
// fetch in the background; subsequent calls play. High-frequency SFX should
// be warmed via warmSounds() so the first heard play is always ready.
type SoundEntry = AudioBuffer | Promise<AudioBuffer | null>

class AudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundEvent, SoundEntry> = new Map()
  private muted: boolean = false
  private initialized: boolean = false
  private listenersBound: boolean = false
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
    }
  }

  // Bind the document-level interaction listeners that unlock the
  // AudioContext on first click/keydown/touchstart. Idempotent — safe to
  // call multiple times. Game-mode mounts call this; content-mode never
  // does, so content-mode visitors never construct an AudioContext or
  // bind these listeners.
  enableInteractionInit() {
    if (this.listenersBound || typeof document === 'undefined') return
    this.listenersBound = true

    const initAudio = () => {
      if (!this.initialized && typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        this.initialized = true

        document.removeEventListener('click', initAudio)
        document.removeEventListener('keydown', initAudio)
        document.removeEventListener('touchstart', initAudio)
      }
    }

    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('keydown', initAudio, { once: true })
    document.addEventListener('touchstart', initAudio, { once: true })
  }

  // Kick off background fetch+decode for the listed events. Game-mode
  // mount calls this for the high-frequency SFX so they're ready by the
  // time the player triggers them. Safe to call before the AudioContext
  // exists — decode runs as soon as the context is created and the data
  // is fetched.
  warmSounds(events: SoundEvent[]) {
    for (const event of events) {
      this.ensureSound(event)
    }
  }

  private soundUrl(event: SoundEvent): string {
    // Prefix every sound URL with the deploy basePath (e.g. '/portfolio')
    // so the assets resolve under GitHub Pages project deploys. Falls back
    // to '' for local dev and root deploys.
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
    return `${base}/sounds/${event}.mp3`
  }

  private ensureSound(event: SoundEvent): SoundEntry | undefined {
    const existing = this.sounds.get(event)
    if (existing) return existing

    const path = this.soundUrl(event)
    const pending: Promise<AudioBuffer | null> = (async () => {
      try {
        const response = await fetch(path)
        if (!response.ok) {
          console.warn(`Sound file not found: ${path}`)
          return null
        }
        const arrayBuffer = await response.arrayBuffer()
        // Wait for the AudioContext to exist before decoding.
        while (!this.audioContext) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
        this.sounds.set(event, audioBuffer)
        return audioBuffer
      } catch (error) {
        console.warn(`Failed to load sound: ${event}`, error)
        return null
      }
    })()
    this.sounds.set(event, pending)
    return pending
  }

  play(event: SoundEvent) {
    if (this.muted || !this.audioContext || !this.initialized) {
      console.log('[Sound]', event, '(muted or not initialized)')
      return
    }

    const entry = this.ensureSound(event)
    const buffer = entry instanceof AudioBuffer ? entry : null
    if (!buffer) {
      // First call for a cold sound: fetch+decode now started in the
      // background, drop this play. Next call will land.
      console.log('[Sound]', event, '(decoding)')
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

// Game-mode mount calls this once. Content-mode never calls it, so
// content-mode visitors never construct an AudioContext and never bind
// document-level click/keydown/touchstart listeners.
export function initAudioOnInteraction(): void {
  audioManager.enableInteractionInit()
}

// Optional helper for game-mode mount: kick off background fetch+decode for
// the high-frequency SFX so the first heard play is never cold.
export function warmSounds(events: SoundEvent[]): void {
  audioManager.warmSounds(events)
}

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