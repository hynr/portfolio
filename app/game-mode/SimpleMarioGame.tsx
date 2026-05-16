'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { level_1_1 } from '@/lib/level-data'
import { playSound, playBlockNote, playMusic, stopMusic } from '@/lib/audio'
import { buildSpriteAtlas, FRAME_H, FRAME_W, type SpriteAtlas } from './spriteAtlas'

const PHYSICS = {
  GRAVITY: 1.0,  // Increased for weightier feel
  GRAVITY_REDUCED: 0.5,  // For variable jump height
  JUMP_VELOCITY: -18,
  MOVE_SPEED: 6,
  MAX_FALL_SPEED: 15,
  FRICTION: 0.88,
  ACCELERATION: 0.8,  // For gradual speed changes
  COYOTE_TIME: 80,  // ms grace period for jumping after walking off ledge
  MAX_JUMP_HOLD: 250  // ms max time for holding jump
}

const WORLD = {
  TILE_SIZE: 32,
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 576,
  WORLD_WIDTH: level_1_1.width,
  GROUND_HEIGHT: level_1_1.groundHeight
}

// Precomputed once from static level data — the loop must not recompute these.
interface QuestionBlock {
  x: number
  y: number
  title: string
  description: string
}

const QUESTION_BLOCKS: QuestionBlock[] = level_1_1.blocks
  .filter(b => b.type === 'question')
  .map(b => {
    const project = level_1_1.projects.find(p => p.id === b.projectId)
    return {
      x: b.x,
      y: b.y,
      title: project?.title || 'Project',
      description: project?.description || 'Description'
    }
  })

const QUESTION_INDEX_BY_XY: Map<string, number> = (() => {
  const map = new Map<string, number>()
  let qi = 0
  for (const b of level_1_1.blocks) {
    if (b.type === 'question') {
      map.set(`${b.x},${b.y}`, qi++)
    }
  }
  return map
})()

const BUSH_DECORATIONS = level_1_1.decorations.filter(d => d.type === 'bush')

interface Player {
  x: number
  y: number
  width: number
  height: number
  velX: number
  velY: number
  targetVelX: number  // For acceleration/deceleration
  onGround: boolean
  facing: 'left' | 'right'
  animationFrame: number
  spriteState: 'idle' | 'walk1' | 'walk2' | 'jump'
  lastGroundTime: number  // For coyote time
  jumpHoldTime: number  // For variable jump
  isJumpHeld: boolean
  squashTime: number  // For landing animation
  scaleY: number  // For squash effect
}

interface BlockAnimation {
  active: boolean
  id: number
  y: number
  originalY: number
  animTime: number
}

interface CoinAnimation {
  active: boolean
  x: number
  y: number
  velY: number
  lifetime: number
}

interface NoteAnimation {
  active: boolean
  x: number
  y: number
  velY: number
  lifetime: number
  maxLifetime: number
  noteIndex: number
}

// Goomba pool — initialized from level_1_1.enemies once and never grown.
// `alive` flips false on stomp; the goomba then renders as a squish frame
// for `deathTime` ms before deactivating. `animTime` is wall-clock ms,
// driven by frame dt, so the waddle stays consistent regardless of frame
// rate — this is the dt-based animation pattern pulled from reruns/mario's
// Sprite.update(dt).
interface GoombaState {
  active: boolean
  x: number
  y: number
  velX: number
  patrolStart: number
  patrolEnd: number
  alive: boolean
  deathTime: number
  animTime: number
}

// Fixed-capacity pools so animation spawn/end don't allocate.
// Level 1-1 has 4 question blocks; 8 slots per pool is plenty.
const ANIM_POOL_SIZE = 8

function makeBlockAnimPool(): BlockAnimation[] {
  const arr: BlockAnimation[] = new Array(ANIM_POOL_SIZE)
  for (let i = 0; i < ANIM_POOL_SIZE; i++) {
    arr[i] = { active: false, id: 0, y: 0, originalY: 0, animTime: 0 }
  }
  return arr
}

function makeCoinAnimPool(): CoinAnimation[] {
  const arr: CoinAnimation[] = new Array(ANIM_POOL_SIZE)
  for (let i = 0; i < ANIM_POOL_SIZE; i++) {
    arr[i] = { active: false, x: 0, y: 0, velY: 0, lifetime: 0 }
  }
  return arr
}

function makeNoteAnimPool(): NoteAnimation[] {
  const arr: NoteAnimation[] = new Array(ANIM_POOL_SIZE)
  for (let i = 0; i < ANIM_POOL_SIZE; i++) {
    arr[i] = { active: false, x: 0, y: 0, velY: 0, lifetime: 0, maxLifetime: 0, noteIndex: 0 }
  }
  return arr
}

const GOOMBA_SIZE = 32
const GOOMBA_DEATH_TIME = 250 // ms goomba stays visible as squished frame

// Brick blocks become head-bonk collidable. Gold-mode bonk shatters them
// into the debris pool; non-gold bonk just plays the thud.
const BRICK_INDICES: number[] = []
for (let i = 0; i < level_1_1.blocks.length; i++) {
  if (level_1_1.blocks[i].type === 'brick') BRICK_INDICES.push(i)
}

const DEBRIS_POOL_SIZE = 32

interface DebrisParticle {
  active: boolean
  x: number
  y: number
  velX: number
  velY: number
  rotation: number
  rotVel: number
  lifetime: number
}

function makeDebrisPool(): DebrisParticle[] {
  const arr: DebrisParticle[] = new Array(DEBRIS_POOL_SIZE)
  for (let i = 0; i < DEBRIS_POOL_SIZE; i++) {
    arr[i] = { active: false, x: 0, y: 0, velX: 0, velY: 0, rotation: 0, rotVel: 0, lifetime: 0 }
  }
  return arr
}

// Floating score popups (+100, +200, etc) drift up over ~45 frames.
const SCORE_POPUP_POOL_SIZE = 16

interface ScorePopup {
  active: boolean
  x: number
  y: number
  velY: number
  lifetime: number
  maxLifetime: number
  text: string
  color: string
}

function makeScorePopupPool(): ScorePopup[] {
  const arr: ScorePopup[] = new Array(SCORE_POPUP_POOL_SIZE)
  for (let i = 0; i < SCORE_POPUP_POOL_SIZE; i++) {
    arr[i] = { active: false, x: 0, y: 0, velY: 0, lifetime: 0, maxLifetime: 0, text: '', color: '#FFFFFF' }
  }
  return arr
}

// End-flag geometry. Pole rises 160px from the ground; flag starts at the
// top and slides down on contact.
const FLAG_X = 2480
const FLAG_POLE_TOP = level_1_1.groundHeight - 160
const FLAG_POLE_BOTTOM = level_1_1.groundHeight - 8
const FLAG_POLE_WIDTH = 6
const PIPE_WIDTH = 40
const PIPE_HEIGHT = 64
const WARP_DURATION = 700 // ms

const TOTAL_GOOMBAS = level_1_1.enemies.filter(e => e.type === 'goomba').length
const TOTAL_COINS = level_1_1.coins.length

function makeGoombaPool(): GoombaState[] {
  const goombas = level_1_1.enemies.filter(e => e.type === 'goomba')
  return goombas.map(e => ({
    active: true,
    x: e.x,
    y: e.y,
    velX: -e.speed,
    patrolStart: e.patrolStart,
    patrolEnd: e.patrolEnd,
    alive: true,
    deathTime: 0,
    animTime: 0,
  }))
}

export default function SimpleMarioGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())

  // Mutable game state lives in refs so the rAF loop binds once and per-frame
  // mutations don't trigger React renders.
  // Player hitbox height matches the sprite atlas (FRAME_H) so the visible
  // feet rest on the ground instead of floating 20px above it. All physics
  // checks read `player.height`, so changing this one number is safe.
  const playerRef = useRef<Player>({
    x: level_1_1.startPosition.x,
    y: level_1_1.groundHeight - FRAME_H,
    width: 32,
    height: FRAME_H,
    velX: 0,
    velY: 0,
    targetVelX: 0,
    onGround: true,
    facing: 'right',
    animationFrame: 0,
    spriteState: 'idle',
    lastGroundTime: 0,
    jumpHoldTime: 0,
    isJumpHeld: false,
    squashTime: 0,
    scaleY: 1
  })
  const cameraRef = useRef({ x: 0, y: 0 })
  // Membership flags as typed arrays — no Set/array growth on the hot path.
  const collectedCoinsRef = useRef<Uint8Array>(new Uint8Array(level_1_1.coins.length))
  const hitBlocksRef = useRef<Uint8Array>(new Uint8Array(QUESTION_BLOCKS.length))
  const blockAnimationsRef = useRef<BlockAnimation[]>(makeBlockAnimPool())
  const coinAnimationsRef = useRef<CoinAnimation[]>(makeCoinAnimPool())
  const noteAnimationsRef = useRef<NoteAnimation[]>(makeNoteAnimPool())
  const goombasRef = useRef<GoombaState[]>(makeGoombaPool())
  // Per-block broken flag (1 = gone). Sized to the full block array so we
  // can index directly by block index; only bricks ever get marked.
  const brokenBlocksRef = useRef<Uint8Array>(new Uint8Array(level_1_1.blocks.length))
  const debrisRef = useRef<DebrisParticle[]>(makeDebrisPool())
  const scorePopupsRef = useRef<ScorePopup[]>(makeScorePopupPool())
  const spawnScorePopup = (x: number, y: number, text: string, color = '#FFFFFF') => {
    const pool = scorePopupsRef.current
    for (let i = 0; i < SCORE_POPUP_POOL_SIZE; i++) {
      if (!pool[i].active) {
        const slot = pool[i]
        slot.active = true
        slot.x = x
        slot.y = y
        slot.velY = -1.4
        slot.lifetime = 45
        slot.maxLifetime = 45
        slot.text = text
        slot.color = color
        return
      }
    }
  }

  // Camera shake — duration ms remaining and starting intensity in px.
  // Decays linearly over the duration; the per-frame offset is applied
  // when computing screen-space draw coords, not to camera.x itself, so
  // the camera lerp stays stable.
  const shakeRef = useRef<{ until: number; intensity: number }>({ until: 0, intensity: 0 })
  const triggerShake = (intensity: number, durationMs: number) => {
    shakeRef.current.intensity = Math.max(shakeRef.current.intensity, intensity)
    shakeRef.current.until = Math.max(shakeRef.current.until, Date.now() + durationMs)
  }
  // Brief post-hit invincibility so a side collision doesn't damage on
  // every frame the player overlaps the goomba.
  const invincibleUntilRef = useRef<number>(0)
  // Stomp triggers a knockback flash on the goomba's last position — kept
  // intentionally minimal; portfolio doesn't need a full damage system.
  const knockbackUntilRef = useRef<number>(0)

  // Pipe warp: when active, input is frozen and the player slides down
  // the pipe over WARP_DURATION; the link opens when the slide completes
  // and the player respawns at level start.
  const warpRef = useRef<{ active: boolean; pipeIndex: number; startTime: number }>({
    active: false,
    pipeIndex: -1,
    startTime: 0,
  })

  // Completionist easter egg trackers. Stomped goombas and collected coins
  // are counted as they happen; when both reach their level totals the
  // bonus fires once and tints Mario gold for the rest of the run.
  const killedGoombasRef = useRef<number>(0)
  const coinCountRef = useRef<number>(0)
  const bonusUnlockedRef = useRef<boolean>(false)
  const [bonusBanner, setBonusBanner] = useState<string | null>(null)

  // End-flag state. Position is hardcoded near level end; flag slides down
  // its pole on contact, then a fade-to-black transitions to content mode.
  const flagRef = useRef<{
    triggered: boolean
    startTime: number
    finished: boolean
  }>({ triggered: false, startTime: 0, finished: false })
  const [fadeAlpha, setFadeAlpha] = useState(0)

  // Background music toggle — persisted across reloads, off by default so
  // visitors aren't surprised by audio.
  const [musicOn, setMusicOn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('mario-music') === 'on'
  })
  const toggleMusic = useCallback(() => {
    setMusicOn(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('mario-music', next ? 'on' : 'off')
      }
      if (next) playMusic('main')
      else stopMusic()
      return next
    })
  }, [])
  // Auto-start music if the user had it on from a previous session — but
  // only after the AudioContext is unlocked by a first interaction.
  useEffect(() => {
    if (!musicOn) {
      stopMusic()
      return
    }
    // Try once now (might no-op if context isn't initialized yet), then
    // again on the next interaction.
    playMusic('main')
    const retry = () => playMusic('main')
    document.addEventListener('click', retry, { once: true })
    document.addEventListener('keydown', retry, { once: true })
    return () => {
      document.removeEventListener('click', retry)
      document.removeEventListener('keydown', retry)
    }
  }, [musicOn])
  // Stop music on unmount (e.g., switching to content mode).
  useEffect(() => {
    return () => { stopMusic() }
  }, [])
  // Sprite atlas — built once at mount; replaces hundreds of fillRects/frame.
  const atlasRef = useRef<SpriteAtlas | null>(null)

  // React state — only what the HUD overlay / text bubble needs to re-render.
  const [score, setScore] = useState(0)
  const [collectedCoinCount, setCollectedCoinCount] = useState(0)
  const [showTextBubble, setShowTextBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState({ title: '', description: '' })
  const [displayedText, setDisplayedText] = useState({ title: '', description: '' })
  const [textAnimationIndex, setTextAnimationIndex] = useState(0)
  const [textFullyDisplayed, setTextFullyDisplayed] = useState(false)

  // Mirror of showTextBubble for the rAF loop to read without re-binding.
  const showTextBubbleRef = useRef(false)
  useEffect(() => { showTextBubbleRef.current = showTextBubble }, [showTextBubble])

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === 'KeyM') {
        toggleMusic()
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        if (showTextBubble) {
          if (!textFullyDisplayed) {
            // Skip to full text
            setDisplayedText(bubbleText)
            setTextAnimationIndex(bubbleText.title.length + bubbleText.description.length)
            setTextFullyDisplayed(true)
          } else {
            // Close bubble
            setShowTextBubble(false)
            setDisplayedText({ title: '', description: '' })
            setTextAnimationIndex(0)
            setTextFullyDisplayed(false)
          }
        }
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [showTextBubble, textFullyDisplayed, bubbleText, toggleMusic])

  // Text animation effect
  useEffect(() => {
    if (showTextBubble && !textFullyDisplayed) {
      const fullText = bubbleText.title + bubbleText.description
      if (textAnimationIndex < fullText.length) {
        const timer = setTimeout(() => {
          const titleLength = bubbleText.title.length
          if (textAnimationIndex < titleLength) {
            setDisplayedText(prev => ({
              ...prev,
              title: bubbleText.title.substring(0, textAnimationIndex + 1)
            }))
          } else {
            setDisplayedText(prev => ({
              ...prev,
              description: bubbleText.description.substring(0, textAnimationIndex - titleLength + 1)
            }))
          }
          setTextAnimationIndex(prev => prev + 1)
          
          if (textAnimationIndex + 1 >= fullText.length) {
            setTextFullyDisplayed(true)
          }
        }, 25) // 25ms per character
        
        return () => clearTimeout(timer)
      }
    }
  }, [showTextBubble, textAnimationIndex, bubbleText, textFullyDisplayed])

  // Download the current canvas frame as a PNG.
  const handleScreenshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      link.download = `mario-portfolio-${ts}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.warn('Screenshot failed', err)
    }
  }, [])

  // Canvas click handling for pipes
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // CSS pixels → logical world units. Backing store is DPR-scaled, so we
    // can't use canvas.width / rect.width; that would give backing pixels.
    const rect = canvas.getBoundingClientRect()
    const cssToLogicalX = WORLD.SCREEN_WIDTH / rect.width
    const cssToLogicalY = WORLD.SCREEN_HEIGHT / rect.height

    const clickX = (e.clientX - rect.left) * cssToLogicalX
    const clickY = (e.clientY - rect.top) * cssToLogicalY

    const camera = cameraRef.current
    const worldX = clickX + camera.x
    const worldY = clickY + camera.y

    // Check if click is on a pipe
    level_1_1.pipes.forEach(pipe => {
      const pipeWidth = 40
      const pipeHeight = 64
      
      if (worldX >= pipe.x && worldX <= pipe.x + pipeWidth &&
          worldY >= pipe.y && worldY <= pipe.y + pipeHeight) {
        
        playSound('pipe-enter')
        
        // Navigate based on pipe linkTo
        switch (pipe.linkTo) {
          case 'github':
            window.open('https://github.com/hynr', '_blank')
            break
          case 'linkedin':
            window.open('https://linkedin.com/in/huzaifa-naroo', '_blank')
            break
          case 'email':
            window.location.href = 'mailto:huzaifa478@gmail.com'
            break
          case 'resume':
            window.open('/resume.pdf', '_blank')
            break
        }
      }
    })
  }, [])

  // Game loop — binds once per mount; all per-frame state is in refs.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // DPR-aware backing store so pixel art stays crisp on retina.
    // Loop still draws in logical SCREEN_WIDTH × SCREEN_HEIGHT coords; the
    // single ctx.scale(dpr, dpr) below maps them to backing pixels.
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1
    canvas.width = WORLD.SCREEN_WIDTH * dpr
    canvas.height = WORLD.SCREEN_HEIGHT * dpr
    ctx.scale(dpr, dpr)

    // Seed coyote-time clock now that we're on the client.
    playerRef.current.lastGroundTime = Date.now()

    // Sky gradient is a function of canvas height only — build it once.
    const skyGradient = ctx.createLinearGradient(0, 0, 0, WORLD.SCREEN_HEIGHT)
    skyGradient.addColorStop(0, '#87CEEB')
    skyGradient.addColorStop(1, '#98FB98')

    // Build the sprite atlas once per mount.
    if (!atlasRef.current) {
      atlasRef.current = buildSpriteAtlas()
      // Dev-only smoke test. process.env.NODE_ENV is inlined at build time,
      // so the dynamic import is dropped from the production bundle.
      if (process.env.NODE_ENV !== 'production') {
        const atlasForTest = atlasRef.current
        import('./spriteAtlas.test')
          .then(m => m.runSpriteAtlasSmokeTest(atlasForTest))
          // eslint-disable-next-line no-console
          .catch(err => console.error('[spriteAtlas.test] failed', err))
      }
    }
    // Disable smoothing on the live ctx so drawImage from the atlas stays
    // pixel-crisp (paired with image-rendering: pixelated on the <canvas>).
    ctx.imageSmoothingEnabled = false

    // Fires once when the player has cleared every goomba AND collected
    // every coin in the level. Adds a bonus to score, tints Mario gold
    // for the rest of the run, and shows a banner.
    const tryUnlockBonus = () => {
      if (bonusUnlockedRef.current) return
      if (killedGoombasRef.current >= TOTAL_GOOMBAS && coinCountRef.current >= TOTAL_COINS) {
        bonusUnlockedRef.current = true
        setScore(prev => prev + 5000)
        setBonusBanner("YOU'RE HIRED ★  +5000")
        playSound('level-complete')
        setTimeout(() => setBonusBanner(null), 3500)
      }
    }

    const gameLoop = () => {
      ctx.clearRect(0, 0, WORLD.SCREEN_WIDTH, WORLD.SCREEN_HEIGHT)

      const player = playerRef.current
      const camera = cameraRef.current
      const keys = keysRef.current
      const bubbleOpen = showTextBubbleRef.current
      const now = Date.now()

      // --- player update ---
      player.animationFrame = (player.animationFrame + 1) % 16

      if (player.squashTime > 0) {
        player.squashTime -= 16
        if (player.squashTime <= 0) {
          player.scaleY = 1
          player.squashTime = 0
        } else {
          player.scaleY = 0.9
        }
      }

      // --- pipe warp animation ---
      // Drives player.y directly while active; physics/input below are
      // gated on !warping so they don't fight the slide.
      const warp = warpRef.current
      const warping = warp.active
      if (warping) {
        const pipe = level_1_1.pipes[warp.pipeIndex]
        const elapsed = now - warp.startTime
        const progress = Math.min(elapsed / WARP_DURATION, 1)
        const eased = progress * progress
        const startY = pipe.y - player.height
        const endY = pipe.y + 32
        player.y = startY + (endY - startY) * eased
        player.velX = 0
        player.velY = 0
        player.spriteState = 'idle'

        if (progress >= 1) {
          // URL was already opened at warp start to stay within the user-
          // activation window — just respawn the player here.
          player.x = level_1_1.startPosition.x
          player.y = level_1_1.groundHeight - player.height
          player.velX = 0
          player.velY = 0
          warp.active = false
          warp.pipeIndex = -1
        }
      }

      // Once the flag is triggered the player freezes for the win sequence.
      const flagTriggered = flagRef.current.triggered
      const frozen = warping || flagTriggered

      const knockedBack = now < knockbackUntilRef.current
      if (!bubbleOpen && !knockedBack && !frozen) {
        if (keys.has('ArrowLeft') || keys.has('KeyA')) {
          player.targetVelX = -PHYSICS.MOVE_SPEED
          player.facing = 'left'
        } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
          player.targetVelX = PHYSICS.MOVE_SPEED
          player.facing = 'right'
        } else {
          player.targetVelX = 0
        }

        const diff = player.targetVelX - player.velX
        if (Math.abs(diff) > 0.1) {
          player.velX += diff * PHYSICS.ACCELERATION
        } else {
          player.velX = player.targetVelX
        }
      } else {
        // During knockback the goomba collision branch wrote velX; let it
        // coast under friction so the bump is visible, then resume input
        // control once the window expires.
        player.targetVelX = 0
        player.velX *= PHYSICS.FRICTION
      }

      const jumpPressed = keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')
      const canJump = player.onGround || (now - player.lastGroundTime < PHYSICS.COYOTE_TIME)

      if (jumpPressed && canJump && !bubbleOpen && !frozen && !player.isJumpHeld) {
        player.velY = PHYSICS.JUMP_VELOCITY
        player.onGround = false
        player.isJumpHeld = true
        player.jumpHoldTime = 0
        playSound('jump')
      }

      if (!frozen) {
        if (jumpPressed && player.isJumpHeld && player.velY < 0) {
          player.jumpHoldTime += 16
          if (player.jumpHoldTime < PHYSICS.MAX_JUMP_HOLD) {
            player.velY += PHYSICS.GRAVITY_REDUCED
          } else {
            player.velY += PHYSICS.GRAVITY
          }
        } else if (!player.onGround) {
          player.velY += PHYSICS.GRAVITY
        }
      }

      if (!jumpPressed) {
        player.isJumpHeld = false
        player.jumpHoldTime = 0
      }

      if (player.velY > PHYSICS.MAX_FALL_SPEED) {
        player.velY = PHYSICS.MAX_FALL_SPEED
      }

      player.x += player.velX
      player.y += player.velY

      if (player.onGround) {
        player.lastGroundTime = now
      }

      if (!player.onGround) {
        player.spriteState = 'jump'
      } else if (Math.abs(player.velX) > 0.5) {
        player.spriteState = Math.floor(player.animationFrame / 8) % 2 === 0 ? 'walk1' : 'walk2'
      } else {
        player.spriteState = 'idle'
      }

      if (player.x < 0) {
        player.x = 0
        player.velX = 0
      }
      if (player.x > WORLD.WORLD_WIDTH - player.width) {
        player.x = WORLD.WORLD_WIDTH - player.width
        player.velX = 0
      }

      // Anim pool handles must be readable both inside the collision gate
      // (block-hit spawns) and outside it (per-frame anim updates), so
      // they're declared at outer scope.
      const blockAnims = blockAnimationsRef.current
      const coinAnims = coinAnimationsRef.current
      const noteAnims = noteAnimationsRef.current

      // --- world/object collisions (skipped during warp + flag freeze
      //     so the player's animated position isn't snapped or re-tripped) ---
      const platforms = level_1_1.platforms
      let onPlatform = false
      const wasAirborne = !frozen && !player.onGround && player.velY > 0
      if (!frozen) {

      for (let i = 0, len = platforms.length; i < len; i++) {
        const platform = platforms[i]
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height <= platform.y + 10 &&
            player.y + player.height >= platform.y - 10 &&
            player.velY >= 0) {
          player.y = platform.y - player.height
          player.velY = 0
          if (wasAirborne && !player.onGround) {
            player.squashTime = 80
            player.scaleY = 0.9
            playSound('land')
          }
          player.onGround = true
          onPlatform = true
        }
      }

      // Pipes are solid: land on top, and the landing kicks off a warp.
      const pipes = level_1_1.pipes
      for (let i = 0, plen = pipes.length; i < plen; i++) {
        const pipe = pipes[i]
        if (player.x + player.width > pipe.x &&
            player.x < pipe.x + PIPE_WIDTH &&
            player.y + player.height <= pipe.y + 10 &&
            player.y + player.height >= pipe.y - 10 &&
            player.velY >= 0) {
          player.y = pipe.y - player.height
          player.velY = 0
          if (wasAirborne && !player.onGround && !warpRef.current.active && pipe.linkTo) {
            // Jumping onto a pipe enters it — Mario style. Open the link
            // immediately (synchronously inside this rAF tick, while the
            // jump's transient user-activation is still valid) so popup
            // blockers don't trip on the deferred end-of-animation call.
            const linkTo = pipe.linkTo
            if (linkTo === 'github') window.open('https://github.com/hynr', '_blank')
            else if (linkTo === 'linkedin') window.open('https://linkedin.com/in/huzaifa-naroo', '_blank')
            else if (linkTo === 'email') window.location.href = 'mailto:huzaifa478@gmail.com'
            else if (linkTo === 'resume') window.open('/resume.pdf', '_blank')

            warpRef.current.active = true
            warpRef.current.pipeIndex = i
            warpRef.current.startTime = now
            player.x = pipe.x + (PIPE_WIDTH - player.width) / 2
            player.velX = 0
            playSound('pipe-enter')
          } else if (wasAirborne && !player.onGround) {
            player.squashTime = 80
            player.scaleY = 0.9
            playSound('land')
          }
          player.onGround = true
          onPlatform = true
        }
      }

      if (player.y + player.height >= WORLD.GROUND_HEIGHT) {
        player.y = WORLD.GROUND_HEIGHT - player.height
        player.velY = 0
        if (wasAirborne && !player.onGround) {
          player.squashTime = 80
          player.scaleY = 0.9
          playSound('land')
        }
        player.onGround = true
      } else if (!onPlatform && player.y + player.height < WORLD.GROUND_HEIGHT) {
        player.onGround = false
      }

      // --- coin collisions ---
      const coins = level_1_1.coins
      const collected = collectedCoinsRef.current
      let coinsCollectedThisFrame = 0
      for (let index = 0, len = coins.length; index < len; index++) {
        if (collected[index] === 0) {
          const coin = coins[index]
          if (player.x + player.width > coin.x &&
              player.x < coin.x + 16 &&
              player.y + player.height > coin.y &&
              player.y < coin.y + 16) {
            collected[index] = 1
            coinsCollectedThisFrame++
            playSound('coin')
            spawnScorePopup(coin.x + 8, coin.y, '+100', '#FFD700')
          }
        }
      }
      if (coinsCollectedThisFrame > 0) {
        const delta = coinsCollectedThisFrame
        coinCountRef.current += delta
        setScore(prev => prev + 100 * delta)
        setCollectedCoinCount(c => c + delta)
        tryUnlockBonus()
      }

      // --- question-block collisions ---
      const hits = hitBlocksRef.current
      for (let index = 0, len = QUESTION_BLOCKS.length; index < len; index++) {
        if (hits[index] === 1) continue
        const block = QUESTION_BLOCKS[index]
        if (player.x + player.width > block.x &&
            player.x < block.x + 32 &&
            player.y < block.y + 32 &&
            player.y + player.height > block.y &&
            player.velY < 0) {
          hits[index] = 1
          setScore(prev => prev + 200)
          spawnScorePopup(block.x + 16, block.y, '+200', '#FFD700')
          setBubbleText({ title: block.title, description: block.description })
          setDisplayedText({ title: '', description: '' })
          setTextAnimationIndex(0)
          setTextFullyDisplayed(false)
          setShowTextBubble(true)
          playSound('block-hit')
          // The block-hit thud layers under the pitched note — note picked
          // by the block's question-index so hitting all four in order
          // climbs a C major triad to the octave.
          playBlockNote(index)

          // Spawn floating ♪ glyph for the visual side of the note.
          for (let s = 0; s < ANIM_POOL_SIZE; s++) {
            if (!noteAnims[s].active) {
              const slot = noteAnims[s]
              slot.active = true
              slot.x = block.x + 16
              slot.y = block.y - 8
              slot.velY = -1.6
              slot.lifetime = 55
              slot.maxLifetime = 55
              slot.noteIndex = index
              break
            }
          }

          // Spawn block animation in first inactive pool slot.
          for (let s = 0; s < ANIM_POOL_SIZE; s++) {
            if (!blockAnims[s].active) {
              const slot = blockAnims[s]
              slot.active = true
              slot.id = index
              slot.y = block.y
              slot.originalY = block.y
              slot.animTime = 0
              break
            }
          }
          // Spawn coin "puff" animation in first inactive pool slot.
          for (let s = 0; s < ANIM_POOL_SIZE; s++) {
            if (!coinAnims[s].active) {
              const slot = coinAnims[s]
              slot.active = true
              slot.x = block.x + 8
              slot.y = block.y - 16
              slot.velY = -8
              slot.lifetime = 60
              break
            }
          }
        }
      }

      // --- brick head-bonks ---
      // Bricks are head-bonk collidable. Gold-mode shatters with debris;
      // non-gold just stops the player and plays the thud.
      const brokenBlocks = brokenBlocksRef.current
      const debris = debrisRef.current
      for (let b = 0; b < BRICK_INDICES.length; b++) {
        const bi = BRICK_INDICES[b]
        if (brokenBlocks[bi] === 1) continue
        const brick = level_1_1.blocks[bi]
        if (player.x + player.width > brick.x &&
            player.x < brick.x + 32 &&
            player.y < brick.y + 32 &&
            player.y + player.height > brick.y &&
            player.velY < 0) {
          // Push the player back below the brick and reverse vertical speed.
          player.y = brick.y + 32
          player.velY = 2
          playSound('block-hit')

          if (bonusUnlockedRef.current) {
            brokenBlocks[bi] = 1
            setScore(prev => prev + 50)
            spawnScorePopup(brick.x + 16, brick.y, '+50', '#FFA500')
            triggerShake(3, 150)
            const cx = brick.x + 16
            const cy = brick.y + 16
            const spreads: ReadonlyArray<readonly [number, number]> = [
              [-3, -8],
              [3, -8],
              [-2, -4],
              [2, -4],
            ]
            for (let s = 0; s < spreads.length; s++) {
              for (let k = 0; k < DEBRIS_POOL_SIZE; k++) {
                if (!debris[k].active) {
                  const piece = debris[k]
                  piece.active = true
                  piece.x = cx
                  piece.y = cy
                  piece.velX = spreads[s][0]
                  piece.velY = spreads[s][1]
                  piece.rotation = Math.random() * Math.PI * 2
                  piece.rotVel = (Math.random() - 0.5) * 0.4
                  piece.lifetime = 50
                  break
                }
              }
            }
          }
        }
      }

      // --- goomba update + player collision ---
      const goombas = goombasRef.current
      const FRAME_DT = 16
      for (let g = 0, glen = goombas.length; g < glen; g++) {
        const goomba = goombas[g]
        if (!goomba.active) continue

        if (!goomba.alive) {
          goomba.deathTime -= FRAME_DT
          if (goomba.deathTime <= 0) {
            goomba.active = false
          }
          continue
        }

        goomba.animTime += FRAME_DT
        goomba.x += goomba.velX
        // Patrol bounds — cheaper than per-frame side-collision against
        // every platform and block; lets the level author hand-tune where
        // each goomba paces.
        if (goomba.x <= goomba.patrolStart) {
          goomba.x = goomba.patrolStart
          goomba.velX = Math.abs(goomba.velX)
        } else if (goomba.x + GOOMBA_SIZE >= goomba.patrolEnd) {
          goomba.x = goomba.patrolEnd - GOOMBA_SIZE
          goomba.velX = -Math.abs(goomba.velX)
        }

        // AABB overlap test against player
        const overlapX = player.x + player.width > goomba.x && player.x < goomba.x + GOOMBA_SIZE
        const overlapY = player.y + player.height > goomba.y && player.y < goomba.y + GOOMBA_SIZE
        if (overlapX && overlapY) {
          // Stomp: player must be descending AND coming from above (foot
          // at or above the goomba's vertical midline this frame).
          const fromAbove = player.velY > 0 && player.y + player.height < goomba.y + GOOMBA_SIZE / 2 + Math.abs(player.velY)
          if (fromAbove) {
            goomba.alive = false
            goomba.deathTime = GOOMBA_DEATH_TIME
            goomba.velX = 0
            player.velY = PHYSICS.JUMP_VELOCITY * 0.55 // springboard
            player.isJumpHeld = false
            killedGoombasRef.current += 1
            setScore(prev => prev + 100)
            spawnScorePopup(goomba.x + GOOMBA_SIZE / 2, goomba.y, '+100', '#FFFFFF')
            playSound('enemy-stomp')
            tryUnlockBonus()
          } else if (now > invincibleUntilRef.current) {
            // Side hit: knock the player back, give a brief grace window
            // so they aren't re-damaged every frame while still touching.
            const dir = player.x < goomba.x ? -1 : 1
            player.velX = dir * 8
            player.velY = -8
            player.onGround = false
            invincibleUntilRef.current = now + 600
            knockbackUntilRef.current = now + 200
            playSound('damage')
            triggerShake(6, 220)
          }
        }
      }

      } // end if (!frozen) — world-collision block

      // --- end-flag detection + animation ---
      if (!flagRef.current.triggered && !warping) {
        if (player.x + player.width > FLAG_X && player.x < FLAG_X + FLAG_POLE_WIDTH + 24) {
          flagRef.current.triggered = true
          flagRef.current.startTime = now
          player.velX = 0
          player.velY = 0
          // Snap the player to the base of the pole, facing right.
          player.x = FLAG_X - player.width
          player.facing = 'right'
          playSound('level-complete')
        }
      }
      if (flagRef.current.triggered) {
        const elapsed = now - flagRef.current.startTime
        // Fade overlay rises after the flag finishes sliding; route to
        // content mode once the screen is fully black.
        if (elapsed > 1500) {
          const fade = Math.min((elapsed - 1500) / 1000, 1)
          setFadeAlpha(fade)
        }
        if (elapsed >= 2500 && !flagRef.current.finished) {
          flagRef.current.finished = true
          window.location.href = '/'
        }
      }

      // --- block animations (walk pool, mutate active slots in place) ---
      for (let i = 0; i < ANIM_POOL_SIZE; i++) {
        const anim = blockAnims[i]
        if (!anim.active) continue
        anim.animTime += 16
        if (anim.animTime < 100) {
          anim.y = anim.originalY - 8 * (1 - anim.animTime / 100)
        } else if (anim.animTime < 300) {
          const t = (anim.animTime - 100) / 200
          anim.y = anim.originalY - 8 * (1 - t)
        } else {
          anim.y = anim.originalY
          anim.active = false
        }
      }

      // --- coin animations (walk pool, mutate active slots in place) ---
      for (let i = 0; i < ANIM_POOL_SIZE; i++) {
        const c = coinAnims[i]
        if (!c.active) continue
        c.velY += 0.5
        c.y += c.velY
        c.lifetime -= 1
        if (c.lifetime <= 0) {
          c.active = false
        }
      }

      // --- note animations (drift up, slight horizontal wobble, fade out) ---
      for (let i = 0; i < ANIM_POOL_SIZE; i++) {
        const n = noteAnims[i]
        if (!n.active) continue
        n.y += n.velY
        n.lifetime -= 1
        if (n.lifetime <= 0) {
          n.active = false
        }
      }

      // --- score popups (drift up, fade out) ---
      const popups = scorePopupsRef.current
      for (let i = 0; i < SCORE_POPUP_POOL_SIZE; i++) {
        const p = popups[i]
        if (!p.active) continue
        p.y += p.velY
        p.velY *= 0.96 // slight deceleration as it floats
        p.lifetime -= 1
        if (p.lifetime <= 0) p.active = false
      }

      // --- debris (gravity-pulled brick chunks from gold-mode breaks) ---
      const debrisList = debrisRef.current
      for (let i = 0; i < DEBRIS_POOL_SIZE; i++) {
        const p = debrisList[i]
        if (!p.active) continue
        p.velY += 0.5
        p.x += p.velX
        p.y += p.velY
        p.rotation += p.rotVel
        p.lifetime -= 1
        if (p.lifetime <= 0) {
          p.active = false
        }
      }

      // --- camera (in-place lerp) ---
      const targetX = player.x - WORLD.SCREEN_WIDTH / 2
      const clampedTargetX = Math.max(0, Math.min(targetX, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))
      camera.x = camera.x + (clampedTargetX - camera.x) * 0.1
      camera.x = Math.max(0, Math.min(camera.x, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))

      // --- camera shake (applied once around every draw call this frame) ---
      let shakeX = 0
      let shakeY = 0
      const shake = shakeRef.current
      if (now < shake.until) {
        const remaining = (shake.until - now) / 250 // assume max 250ms shakes
        const k = shake.intensity * Math.min(remaining, 1)
        shakeX = (Math.random() - 0.5) * k * 2
        shakeY = (Math.random() - 0.5) * k * 2
      } else {
        shake.intensity = 0
      }
      ctx.save()
      ctx.translate(shakeX, shakeY)

      // --- background (sky) ---
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, WORLD.SCREEN_WIDTH, WORLD.SCREEN_HEIGHT)

      // --- clouds (slow leftward drift, wraps across world width) ---
      ctx.fillStyle = 'white'
      const CLOUD_COUNT = 10
      const CLOUD_SPACING = WORLD.WORLD_WIDTH / CLOUD_COUNT
      // 25px/sec leftward; wraps at world width so clouds re-enter from
      // the right after exiting the left edge.
      const cloudDrift = (now / 40) % WORLD.WORLD_WIDTH
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const baseX = i * CLOUD_SPACING + 100
        const worldX = ((baseX - cloudDrift) % WORLD.WORLD_WIDTH + WORLD.WORLD_WIDTH) % WORLD.WORLD_WIDTH
        // Parallax: only shift by 30% of camera so clouds feel distant.
        const cloudX = worldX - camera.x * 0.3
        if (cloudX > -100 && cloudX < WORLD.SCREEN_WIDTH + 100) {
          drawCloud(ctx, cloudX, 80 + (i % 3) * 40)
        }
      }

      // --- bushes ---
      for (let i = 0, len = BUSH_DECORATIONS.length; i < len; i++) {
        const bush = BUSH_DECORATIONS[i]
        const bushX = bush.x - camera.x
        if (bushX > -60 && bushX < WORLD.SCREEN_WIDTH) {
          drawBush(ctx, bushX, bush.y - camera.y)
        }
      }

      // --- pipes ---
      const pipes = level_1_1.pipes
      for (let i = 0, len = pipes.length; i < len; i++) {
        const pipe = pipes[i]
        const pipeX = pipe.x - camera.x
        if (pipeX > -40 && pipeX < WORLD.SCREEN_WIDTH) {
          drawPipe(ctx, pipeX, pipe.y - camera.y)
        }
      }

      // --- ground ---
      const groundY = WORLD.GROUND_HEIGHT - camera.y
      const groundHeight = WORLD.SCREEN_HEIGHT - groundY

      ctx.fillStyle = '#8B4513'
      ctx.fillRect(0, groundY, WORLD.SCREEN_WIDTH, groundHeight)

      ctx.fillStyle = '#A0522D'
      const brickWidth = 32
      const brickHeight = 16
      for (let x = 0; x < WORLD.SCREEN_WIDTH + brickWidth; x += brickWidth) {
        for (let y = groundY + 10; y < WORLD.SCREEN_HEIGHT; y += brickHeight) {
          const offsetX = (Math.floor((y - groundY) / brickHeight) % 2) * (brickWidth / 2)
          const brickX = x + offsetX
          if (brickX < WORLD.SCREEN_WIDTH) {
            ctx.fillRect(brickX, y, brickWidth - 2, brickHeight - 2)
          }
        }
      }

      ctx.fillStyle = '#32CD32'
      ctx.fillRect(0, groundY, WORLD.SCREEN_WIDTH, 10)

      drawPlatforms(ctx, camera)
      drawGoombas(ctx, camera)
      drawFlag(ctx, camera, now)
      drawPlayer(ctx, player, camera)
      // Re-draw the warping pipe on top of the player so the slide looks
      // like it's actually going inside the pipe (the pipe body fully
      // obscures the player's body once it dips below the rim).
      if (warpRef.current.active) {
        const wp = level_1_1.pipes[warpRef.current.pipeIndex]
        drawPipe(ctx, wp.x - camera.x, wp.y - camera.y)
      }
      drawPipeHints(ctx, camera, player, now)

      // Close the shake transform — HUD overlays live outside the canvas
      // so they aren't affected.
      ctx.restore()

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.arc(x + 20, y, 25, 0, Math.PI * 2)
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2)
    ctx.arc(x + 10, y - 15, 15, 0, Math.PI * 2)
    ctx.arc(x + 30, y - 15, 15, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, type: 'brick' | 'question') => {
    const blockSize = 32
    
    if (type === 'brick') {
      // Brick block
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(x, y, blockSize, blockSize)
      
      // Brick pattern
      ctx.fillStyle = '#A0522D'
      ctx.fillRect(x + 2, y + 2, 12, 6)
      ctx.fillRect(x + 18, y + 2, 12, 6)
      ctx.fillRect(x + 2, y + 12, 28, 8)
      ctx.fillRect(x + 2, y + 24, 12, 6)
      ctx.fillRect(x + 18, y + 24, 12, 6)
      
      // Highlight
      ctx.fillStyle = '#DEB887'
      ctx.fillRect(x, y, blockSize, 2)
      ctx.fillRect(x, y, 2, blockSize)
    } else {
      // Question block
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(x, y, blockSize, blockSize)
      
      // Question mark
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('?', x + 16, y + 22)
      
      // Border
      ctx.strokeStyle = '#FFA500'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, blockSize, blockSize)
    }
  }

  const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Spinning coin effect
    const time = Date.now() / 200
    const scale = Math.abs(Math.sin(time))
    
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.ellipse(x + 8, y + 8, 8 * Math.max(scale, 0.3), 8, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#FFA500'
    ctx.beginPath()
    ctx.ellipse(x + 8, y + 8, 6 * Math.max(scale, 0.3), 6, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawBush = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Green bush with multiple sections
    ctx.fillStyle = '#228B22'
    
    // Main bush body - three overlapping circles
    ctx.beginPath()
    ctx.arc(x + 15, y + 20, 12, 0, Math.PI * 2)
    ctx.arc(x + 30, y + 18, 14, 0, Math.PI * 2)
    ctx.arc(x + 45, y + 20, 12, 0, Math.PI * 2)
    ctx.fill()
    
    // Highlight
    ctx.fillStyle = '#32CD32'
    ctx.beginPath()
    ctx.arc(x + 15, y + 18, 8, 0, Math.PI * 2)
    ctx.arc(x + 30, y + 16, 10, 0, Math.PI * 2)
    ctx.arc(x + 45, y + 18, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawPipe = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Green Mario-style pipe
    const pipeWidth = 40
    const pipeHeight = 64
    
    // Main pipe body
    ctx.fillStyle = '#00AA00'
    ctx.fillRect(x + 4, y, pipeWidth - 8, pipeHeight)
    
    // Pipe rim (top)
    ctx.fillStyle = '#00DD00'
    ctx.fillRect(x, y, pipeWidth, 8)
    
    // Pipe highlights
    ctx.fillStyle = '#22FF22'
    ctx.fillRect(x + 6, y + 8, 4, pipeHeight - 8)
    ctx.fillRect(x + pipeWidth - 10, y + 8, 4, pipeHeight - 8)
    
    // Pipe shadows
    ctx.fillStyle = '#008800'
    ctx.fillRect(x + 2, y + 2, pipeWidth - 4, 4)
    ctx.fillRect(x + pipeWidth - 8, y + 8, 4, pipeHeight - 8)
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  const drawFlag = (
    ctx: CanvasRenderingContext2D,
    camera: { x: number; y: number },
    now: number,
  ) => {
    const screenX = FLAG_X - camera.x
    if (screenX < -80 || screenX > WORLD.SCREEN_WIDTH + 80) return

    // Pole base block
    ctx.fillStyle = '#444'
    ctx.fillRect(screenX - 8, FLAG_POLE_BOTTOM - camera.y, FLAG_POLE_WIDTH + 16, 8)
    // Pole shaft
    ctx.fillStyle = '#C0C0C0'
    ctx.fillRect(screenX, FLAG_POLE_TOP - camera.y, FLAG_POLE_WIDTH, FLAG_POLE_BOTTOM - FLAG_POLE_TOP)
    // Pole tip (ball on top)
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(screenX + FLAG_POLE_WIDTH / 2, FLAG_POLE_TOP - camera.y - 4, 6, 0, Math.PI * 2)
    ctx.fill()

    // Flag position: starts at top, slides down on trigger over 1500ms.
    const flagTop = FLAG_POLE_TOP + 6
    const flagBottom = FLAG_POLE_BOTTOM - 28
    let flagY = flagTop
    if (flagRef.current.triggered) {
      const elapsed = now - flagRef.current.startTime
      const slideT = Math.min(elapsed / 1500, 1)
      // Ease-out so the descent looks weighted at the end.
      const eased = 1 - Math.pow(1 - slideT, 2)
      flagY = flagTop + (flagBottom - flagTop) * eased
    }

    // Triangular flag (red with white "1UP" stripe)
    const flagX = screenX + FLAG_POLE_WIDTH
    const flagScreenY = flagY - camera.y
    ctx.fillStyle = '#E63946'
    ctx.beginPath()
    ctx.moveTo(flagX, flagScreenY)
    ctx.lineTo(flagX + 28, flagScreenY + 12)
    ctx.lineTo(flagX, flagScreenY + 24)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(flagX + 4, flagScreenY + 10, 14, 4)
  }

  const drawPipeHints = (
    ctx: CanvasRenderingContext2D,
    camera: { x: number; y: number },
    player: Player,
    now: number,
  ) => {
    const pipes = level_1_1.pipes
    const PIPE_W = 40
    const labels: Record<string, string> = {
      github: 'GITHUB',
      linkedin: 'LINKEDIN',
      email: 'EMAIL',
      resume: 'RESUME',
    }

    const activeWarpPipe = warpRef.current.active ? warpRef.current.pipeIndex : -1
    for (let i = 0, plen = pipes.length; i < plen; i++) {
      if (i === activeWarpPipe) continue
      const pipe = pipes[i]
      const screenX = pipe.x - camera.x
      if (screenX < -120 || screenX > WORLD.SCREEN_WIDTH + 120) continue

      const linkTo = pipe.linkTo
      if (!linkTo) continue
      const label = labels[linkTo] ?? 'OPEN'

      // Player proximity intensifies the hint — within 200px it gets bigger
      // and brighter so the player notices the affordance.
      const playerCenterX = player.x + player.width / 2
      const pipeCenterX = pipe.x + PIPE_W / 2
      const distX = Math.abs(playerCenterX - pipeCenterX)
      const near = distX < 200
      const proximity = near ? 1 - Math.min(distX / 200, 1) : 0

      const bob = Math.sin(now / 240 + i * 0.7) * 4
      const pulse = 1 + proximity * 0.15
      const text = `▼ JUMP IN · ${label}`

      const fontSize = Math.round(10 * pulse)
      ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const padX = 8
      const padY = 6
      const metrics = ctx.measureText(text)
      const boxW = metrics.width + padX * 2
      const boxH = fontSize + padY * 2
      const cx = pipe.x - camera.x + PIPE_W / 2
      const cy = pipe.y - camera.y - 28 + bob

      // Speech-bubble box with rounded edges; alpha rises with proximity
      // so distant pipes whisper and nearby ones declare.
      const baseAlpha = 0.75 + proximity * 0.25
      ctx.globalAlpha = baseAlpha
      ctx.fillStyle = near ? '#FFD700' : '#FFFFFF'
      roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 4)
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#000000'
      ctx.stroke()

      // Little downward triangle pointing at the pipe.
      ctx.beginPath()
      ctx.moveTo(cx - 5, cy + boxH / 2)
      ctx.lineTo(cx + 5, cy + boxH / 2)
      ctx.lineTo(cx, cy + boxH / 2 + 6)
      ctx.closePath()
      ctx.fillStyle = near ? '#FFD700' : '#FFFFFF'
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#000000'
      ctx.fillText(text, cx, cy)
      ctx.globalAlpha = 1
    }
    ctx.textBaseline = 'alphabetic'
  }

  const drawGoombas = (ctx: CanvasRenderingContext2D, camera: { x: number; y: number }) => {
    const atlas = atlasRef.current
    if (!atlas) return
    const goombas = goombasRef.current
    for (let g = 0, glen = goombas.length; g < glen; g++) {
      const goomba = goombas[g]
      if (!goomba.active) continue
      const screenX = goomba.x - camera.x
      const screenY = goomba.y - camera.y
      if (screenX <= -GOOMBA_SIZE || screenX >= WORLD.SCREEN_WIDTH) continue

      // Pick frame: squish if dying, else alternate walk1/walk2 every 200ms.
      const frame = !goomba.alive
        ? atlas.goombaFrameMap.gDead
        : (Math.floor(goomba.animTime / 200) % 2 === 0
            ? atlas.goombaFrameMap.gWalk1
            : atlas.goombaFrameMap.gWalk2)

      ctx.save()
      // Mirror sprite to match facing — pivot around horizontal center.
      if (goomba.velX > 0) {
        ctx.translate(screenX + GOOMBA_SIZE / 2, screenY)
        ctx.scale(-1, 1)
        ctx.translate(-GOOMBA_SIZE / 2, 0)
      } else {
        ctx.translate(screenX, screenY)
      }
      ctx.drawImage(
        atlas.canvas as CanvasImageSource,
        frame.sx, frame.sy, frame.sw, frame.sh,
        0, 0, GOOMBA_SIZE, GOOMBA_SIZE,
      )
      ctx.restore()
    }
  }

  const drawPlatforms = (ctx: CanvasRenderingContext2D, camera: { x: number; y: number }) => {
    const platforms = level_1_1.platforms
    const blockAnims = blockAnimationsRef.current
    const hits = hitBlocksRef.current
    const coinAnims = coinAnimationsRef.current
    const noteAnims = noteAnimationsRef.current
    const collected = collectedCoinsRef.current

    // Platforms — brick rendered tile-by-tile, cloud rendered as a single
    // translucent puffy bar so it visually reads as "stand-on-able sky".
    for (let p = 0, plen = platforms.length; p < plen; p++) {
      const platform = platforms[p]
      const screenX = platform.x - camera.x
      const screenY = platform.y - camera.y
      if (screenX <= -platform.width || screenX >= WORLD.SCREEN_WIDTH) continue

      if (platform.type === 'cloud') {
        // Translucent puffy cloud body
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        // Rounded body with hump bumps along the top
        const w = platform.width
        const h = platform.height
        roundRect(ctx, screenX, screenY, w, h, 8)
        ctx.fill()
        ctx.strokeStyle = 'rgba(60, 120, 180, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        // Two top humps for that classic cloud silhouette
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        ctx.beginPath()
        ctx.arc(screenX + w * 0.3, screenY, h * 0.7, Math.PI, Math.PI * 2)
        ctx.arc(screenX + w * 0.65, screenY, h * 0.9, Math.PI, Math.PI * 2)
        ctx.fill()
      } else {
        const blocksWide = platform.width / 32
        for (let i = 0; i < blocksWide; i++) {
          drawBlock(ctx, screenX + i * 32, screenY, 'brick')
        }
      }
    }

    // All blocks
    const allBlocks = level_1_1.blocks
    const broken = brokenBlocksRef.current
    for (let b = 0, blen = allBlocks.length; b < blen; b++) {
      if (broken[b] === 1) continue
      const block = allBlocks[b]
      const screenX = block.x - camera.x
      const screenY = block.y - camera.y
      if (screenX <= -32 || screenX >= WORLD.SCREEN_WIDTH) continue

      if (block.type === 'question') {
        const questionIndex = QUESTION_INDEX_BY_XY.get(`${block.x},${block.y}`) ?? -1
        // Find this block's anim slot in the pool, if any.
        let animY = block.y
        for (let s = 0; s < ANIM_POOL_SIZE; s++) {
          const a = blockAnims[s]
          if (a.active && a.id === questionIndex) {
            animY = a.y
            break
          }
        }
        const animatedScreenY = animY - camera.y

        if (questionIndex >= 0 && hits[questionIndex] === 1) {
          ctx.fillStyle = '#8B4513'
          ctx.fillRect(screenX, animatedScreenY, 32, 32)
          ctx.fillStyle = '#654321'
          ctx.fillRect(screenX + 2, animatedScreenY + 2, 28, 28)
          ctx.strokeStyle = '#4A2C17'
          ctx.lineWidth = 2
          ctx.strokeRect(screenX + 4, animatedScreenY + 4, 24, 24)
        } else {
          drawBlock(ctx, screenX, animatedScreenY, 'question')
        }
      } else {
        drawBlock(ctx, screenX, screenY, 'brick')
      }
    }

    // Coin "puff" animations from question-block hits (walk pool)
    for (let s = 0; s < ANIM_POOL_SIZE; s++) {
      const coin = coinAnims[s]
      if (!coin.active) continue
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH) {
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#FFA500'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 5, 0, Math.PI * 2)
        ctx.fill()

        // (score popup is rendered separately so the +200 lasts longer
        // than the coin-puff sprite)
      }
    }

    // Floating ♪ glyphs from block hits — note index drives a hue shift
    // so each block's note has a distinct color (matches the pitch climb).
    const noteColors = ['#FF6B9D', '#FFB347', '#7BD389', '#67C7EB']
    ctx.font = 'bold 22px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let s = 0; s < ANIM_POOL_SIZE; s++) {
      const note = noteAnims[s]
      if (!note.active) continue
      const screenX = note.x - camera.x
      const screenY = note.y - camera.y
      if (screenX > -24 && screenX < WORLD.SCREEN_WIDTH + 24) {
        const alpha = note.maxLifetime > 0 ? note.lifetime / note.maxLifetime : 0
        const color = noteColors[note.noteIndex % noteColors.length]
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
        ctx.fillStyle = color
        ctx.fillText('♪', screenX, screenY)
        ctx.globalAlpha = 1
      }
    }
    ctx.textBaseline = 'alphabetic'

    // Static coins
    const coins = level_1_1.coins
    for (let i = 0, len = coins.length; i < len; i++) {
      if (collected[i] === 1) continue
      const coin = coins[i]
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH) {
        drawCoin(ctx, screenX, screenY)
      }
    }

    // Debris chunks from gold-mode brick breaks
    const debrisList = debrisRef.current
    for (let i = 0; i < DEBRIS_POOL_SIZE; i++) {
      const p = debrisList[i]
      if (!p.active) continue
      const screenX = p.x - camera.x
      const screenY = p.y - camera.y
      if (screenX < -20 || screenX > WORLD.SCREEN_WIDTH + 20) continue
      const alpha = p.lifetime > 20 ? 1 : p.lifetime / 20
      ctx.save()
      ctx.translate(screenX, screenY)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(-6, -6, 12, 12)
      ctx.strokeStyle = '#5C2C0C'
      ctx.lineWidth = 1
      ctx.strokeRect(-6, -6, 12, 12)
      ctx.globalAlpha = 1
      ctx.restore()
    }

    // Floating score popups (+100 / +200 / etc.) — render on top of
    // everything in the world layer.
    const popups = scorePopupsRef.current
    ctx.font = 'bold 14px "Press Start 2P", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 3
    for (let i = 0; i < SCORE_POPUP_POOL_SIZE; i++) {
      const p = popups[i]
      if (!p.active) continue
      const screenX = p.x - camera.x
      const screenY = p.y - camera.y
      if (screenX < -30 || screenX > WORLD.SCREEN_WIDTH + 30) continue
      const alpha = p.maxLifetime > 0 ? p.lifetime / p.maxLifetime : 0
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.strokeStyle = '#000000'
      ctx.strokeText(p.text, screenX, screenY)
      ctx.fillStyle = p.color
      ctx.fillText(p.text, screenX, screenY)
    }
    ctx.globalAlpha = 1
    ctx.textBaseline = 'alphabetic'
    ctx.lineWidth = 1
  }

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, camera: { x: number; y: number }) => {
    const atlas = atlasRef.current
    if (!atlas) return

    // Skip every other ~60ms during invincibility to flicker the sprite —
    // standard NES damage cue.
    const now = Date.now()
    if (now < invincibleUntilRef.current && Math.floor(now / 60) % 2 === 0) {
      return
    }

    const screenX = player.x - camera.x
    const screenY = player.y - camera.y
    const frame = atlas.frameMap[player.spriteState]

    ctx.save()
    // Anchor at bottom-center so squash + facing flip pivot correctly.
    if (player.facing === 'left') {
      ctx.translate(screenX + player.width / 2, screenY + player.height)
      ctx.scale(-1, player.scaleY)
      ctx.translate(-player.width / 2, -player.height)
    } else {
      ctx.translate(screenX + player.width / 2, screenY + player.height)
      ctx.scale(1, player.scaleY)
      ctx.translate(-player.width / 2, -player.height)
    }

    // One blit instead of ~250 fillStyle/fillRect pairs.
    ctx.drawImage(
      atlas.canvas as CanvasImageSource,
      frame.sx, frame.sy, frame.sw, frame.sh,
      0, 0, FRAME_W, FRAME_H,
    )

    // Easter-egg gold tint — `source-atop` confines the fill to the
    // sprite's existing alpha, so the rect doesn't leak past the body.
    if (bonusUnlockedRef.current) {
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = 'rgba(255, 215, 0, 0.45)'
      ctx.fillRect(0, 0, FRAME_W, FRAME_H)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <canvas
        ref={canvasRef}
        width={WORLD.SCREEN_WIDTH}
        height={WORLD.SCREEN_HEIGHT}
        onClick={handleCanvasClick}
        style={{
          width: '100vw',
          height: '100vh',
          imageRendering: 'pixelated',
          background: 'transparent',
          display: 'block',
          cursor: 'crosshair'
        }}
      />

      {/* Fade-to-black overlay used by the end-flag win sequence. */}
      {fadeAlpha > 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'black',
            opacity: fadeAlpha,
            pointerEvents: 'none',
            zIndex: 999,
            transition: 'opacity 80ms linear',
          }}
        />
      )}

      {/* Bonus banner — fired by the completionist easter egg. */}
      {bonusBanner && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '16px 28px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: '#1a1a1a',
            border: '3px solid #000',
            borderRadius: '6px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            letterSpacing: '0.05em',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 998,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          {bonusBanner}
        </div>
      )}

      {/* HUD Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: 'white',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>HUZAIFA</div>
          <div>{score.toString().padStart(6, '0')}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <div>WORLD 1-1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#FFD700' }}>●</span>
            <span>× {collectedCoinCount.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <div>TIME</div>
          <div>400</div>
        </div>
      </div>
      
      {/* Controls Hint */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 15px',
        borderRadius: '4px',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: 'white',
        pointerEvents: 'none'
      }}>
        ARROWS: MOVE  SPACE: JUMP
      </div>
      
      {/* Screenshot + Music toggles — anchored bottom-right to stay clear
          of both the Content mode and PLAIN MODE buttons in the top-right. */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 1000,
      }}>
        <button
          onClick={handleScreenshot}
          aria-label="Download screenshot"
          title="Download screenshot"
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            width: '44px',
            height: '44px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          📷
        </button>
        <button
          onClick={() => toggleMusic()}
          aria-label={musicOn ? 'Mute music' : 'Play music'}
          title={musicOn ? 'Mute music (M)' : 'Play music (M)'}
          style={{
            background: musicOn ? 'rgba(255,215,0,0.9)' : 'rgba(0,0,0,0.7)',
            color: musicOn ? '#000' : 'white',
            border: '2px solid white',
            borderRadius: '8px',
            width: '44px',
            height: '44px',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {musicOn ? '♪' : '♪̸'}
        </button>
      </div>

      {/* Plain Mode Toggle */}
      <button
        onClick={() => {
          localStorage.setItem('displayMode', 'plain')
          window.location.href = '/'
        }}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        PLAIN MODE
      </button>
      
      {/* Pokemon-style Text Bubble */}
      {showTextBubble && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw',
          maxWidth: '800px',
          minHeight: '120px',
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '11px',
          lineHeight: '1.6',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '12px', 
            color: '#000',
            fontSize: '13px'
          }}>
            {displayedText.title}
          </div>
          <div style={{ 
            color: '#333', 
            marginBottom: '8px',
            minHeight: '40px'
          }}>
            {displayedText.description}
          </div>
          <div style={{ 
            textAlign: 'right', 
            fontSize: '9px', 
            color: '#666',
            marginTop: '8px'
          }}>
            {textFullyDisplayed ? '[SPACE to close]' : '[SPACE to skip]'}
          </div>
        </div>
      )}
    </div>
  )
}