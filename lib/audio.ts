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

// Per-event file extension. The "mp3" files were actually 16-bit PCM WAVs
// with .mp3 extensions; we re-encoded the longer sounds to AAC where it
// saves bytes and renamed the rest to their true .wav extension. Short
// SFX stay WAV because the AAC container overhead exceeds any savings on
// sub-200ms clips. Both formats decode via Web Audio decodeAudioData.
const SOUND_EXT: Record<SoundEvent, 'wav' | 'm4a'> = {
  'jump': 'wav',
  'land': 'wav',
  'block-hit': 'wav',
  'pause': 'wav',
  'enemy-stomp': 'wav',
  'footstep': 'wav',
  'damage': 'wav',
  'coin': 'm4a',
  'block-reveal': 'm4a',
  'pipe-enter': 'm4a',
  'level-complete': 'm4a',
  'die': 'm4a',
  'game-over': 'm4a',
}

// Per-event lazy decode. The map stores either:
//   - undefined: never requested, no fetch in flight
//   - Promise<AudioBuffer | null>: fetch+decode in flight
//   - AudioBuffer: ready to play
// First call for an unfetched event drops (decode is async) and starts the
// fetch in the background; subsequent calls play. High-frequency SFX should
// be warmed via warmSounds() so the first heard play is always ready.
type SoundEntry = AudioBuffer | Promise<AudioBuffer | null>

// Original 16-step phrase in C major. Pairs of [frequency Hz, duration s].
// Loops indefinitely; written so it isn't a copy of any branded melody.
const MUSIC_MELODY: ReadonlyArray<readonly [number, number]> = [
  [261.63, 0.18], [329.63, 0.18], [392.00, 0.18], [523.25, 0.36],
  [392.00, 0.18], [440.00, 0.18], [493.88, 0.18], [523.25, 0.36],
  [440.00, 0.18], [392.00, 0.18], [329.63, 0.36], [392.00, 0.18],
  [261.63, 0.18], [293.66, 0.18], [329.63, 0.18], [261.63, 0.54],
]

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
  // Music engine state — scheduler walks the melody array, queuing notes
  // 500ms ahead so timing stays steady even if the main thread stalls.
  private musicPlaying: boolean = false
  private musicGain: GainNode | null = null
  private musicNoteIndex: number = 0
  private musicNextNoteTime: number = 0
  private musicSchedulerHandle: number | null = null

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
    return `${base}/sounds/${event}.${SOUND_EXT[event]}`
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

  // Pure Web Audio pitched note — no asset fetch. Triangle wave with a
  // short percussive envelope (10ms attack, 180ms exponential decay) so it
  // reads as a chiptune blip rather than a sustained tone. Frequency comes
  // from the caller; SimpleMarioGame picks a melody per question block.
  playNote(frequency: number) {
    if (this.muted || !this.audioContext || !this.initialized) return
    try {
      const ctx = this.audioContext
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = frequency
      const now = ctx.currentTime
      // Use exponentialRamp because it can't accept zero — start at a tiny
      // positive value, jump to peak, then decay. Peak well below master
      // mix so it layers under the existing block-hit thud.
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch (error) {
      console.warn('Failed to play note:', frequency, error)
    }
  }

  setMuted(isMuted: boolean) {
    this.muted = isMuted
    localStorage.setItem('audio-muted', String(isMuted))
  }

  getMuted(): boolean {
    return this.muted
  }

  // ---------- background music ----------

  // Force-create the AudioContext if it doesn't exist yet. Must be called
  // synchronously from a user gesture (click/keydown) — that's the only
  // time browsers allow context creation without auto-suspending it.
  private ensureContext(): AudioContext | null {
    if (this.audioContext) return this.audioContext
    if (typeof window === 'undefined') return null
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.initialized = true
      return this.audioContext
    } catch {
      return null
    }
  }

  startMusic() {
    if (this.musicPlaying) return
    // Create the context here if needed — startMusic is always invoked from
    // a click or keydown handler, so the user-gesture requirement is met.
    const ctx = this.ensureContext()
    if (!ctx) return
    // Resume in case it was auto-suspended (some browsers do this when the
    // page loses focus or on Safari first creation).
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined)
    }
    this.musicPlaying = true
    if (!this.musicGain) {
      this.musicGain = ctx.createGain()
      this.musicGain.gain.value = 0.15 // quiet bed under SFX but actually audible
      this.musicGain.connect(ctx.destination)
    }
    this.musicNoteIndex = 0
    this.musicNextNoteTime = ctx.currentTime + 0.05
    this.musicScheduler()
    this.musicSchedulerHandle = window.setInterval(() => this.musicScheduler(), 80)
  }

  stopMusic() {
    this.musicPlaying = false
    if (this.musicSchedulerHandle !== null) {
      clearInterval(this.musicSchedulerHandle)
      this.musicSchedulerHandle = null
    }
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying
  }

  private musicScheduler() {
    if (!this.musicPlaying || !this.audioContext || !this.musicGain) return
    const lookAhead = 0.4 // seconds ahead to schedule
    while (this.musicNextNoteTime < this.audioContext.currentTime + lookAhead) {
      const [freq, dur] = MUSIC_MELODY[this.musicNoteIndex]
      this.scheduleMusicNote(freq, this.musicNextNoteTime, dur)
      this.musicNextNoteTime += dur
      this.musicNoteIndex = (this.musicNoteIndex + 1) % MUSIC_MELODY.length
    }
  }

  private scheduleMusicNote(freq: number, t: number, duration: number) {
    if (!this.audioContext || !this.musicGain) return
    const osc = this.audioContext.createOscillator()
    const noteGain = this.audioContext.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    // Short attack + sustain + decay envelope for a chiptune pluck.
    noteGain.gain.setValueAtTime(0.0001, t)
    noteGain.gain.exponentialRampToValueAtTime(0.55, t + 0.01)
    noteGain.gain.setValueAtTime(0.55, t + duration * 0.55)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.95)
    osc.connect(noteGain)
    noteGain.connect(this.musicGain)
    osc.start(t)
    osc.stop(t + duration)
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

// Question-block melody: ascending C major triad + octave. Each call plays
// one note; SimpleMarioGame walks the array in order as blocks are hit, so
// hitting all four forms a tiny musical phrase.
export const BLOCK_NOTE_FREQS = [523.25, 659.25, 783.99, 1046.5] as const

export function playBlockNote(noteIndex: number): void {
  const freq = BLOCK_NOTE_FREQS[noteIndex % BLOCK_NOTE_FREQS.length]
  audioManager.playNote(freq)
}

let muted = false

export function setMuted(isMuted: boolean): void {
  muted = isMuted
  audioManager.setMuted(isMuted)
}

export function getMuted(): boolean {
  return audioManager.getMuted()
}

export function playMusic(_track: 'main' | 'underground' | 'castle' | 'victory' = 'main'): void {
  audioManager.startMusic()
}

export function stopMusic(): void {
  audioManager.stopMusic()
}

export function isMusicPlaying(): boolean {
  return audioManager.isMusicPlaying()
}