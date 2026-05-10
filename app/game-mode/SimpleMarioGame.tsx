'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { level_1_1 } from '@/lib/level-data'
import { playSound } from '@/lib/audio'

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
  id: number
  y: number
  originalY: number
  animTime: number
}

interface CoinAnimation {
  x: number
  y: number
  velY: number
  lifetime: number
}

export default function SimpleMarioGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysRef = useRef<Set<string>>(new Set())

  // Mutable game state lives in refs so the rAF loop binds once and per-frame
  // mutations don't trigger React renders.
  const playerRef = useRef<Player>({
    x: level_1_1.startPosition.x,
    y: level_1_1.groundHeight - 64,
    width: 32,
    height: 64,
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
  const collectedCoinsRef = useRef<Set<number>>(new Set())
  const hitBlocksRef = useRef<Set<number>>(new Set())
  const blockAnimationsRef = useRef<BlockAnimation[]>([])
  const coinAnimationsRef = useRef<CoinAnimation[]>([])

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
  }, [showTextBubble, textFullyDisplayed, bubbleText])

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

  // Canvas click handling for pipes
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    // Convert screen coordinates to world coordinates
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

    // Seed coyote-time clock now that we're on the client.
    playerRef.current.lastGroundTime = Date.now()

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

      if (!bubbleOpen) {
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
        player.targetVelX = 0
        player.velX *= PHYSICS.FRICTION
      }

      const jumpPressed = keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')
      const canJump = player.onGround || (now - player.lastGroundTime < PHYSICS.COYOTE_TIME)

      if (jumpPressed && canJump && !bubbleOpen && !player.isJumpHeld) {
        player.velY = PHYSICS.JUMP_VELOCITY
        player.onGround = false
        player.isJumpHeld = true
        player.jumpHoldTime = 0
        playSound('jump')
      }

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

      // --- platform collisions ---
      const platforms = level_1_1.platforms
      let onPlatform = false
      const wasAirborne = !player.onGround && player.velY > 0

      platforms.forEach(platform => {
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
      })

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
      coins.forEach((coin, index) => {
        if (!collected.has(index) &&
            player.x + player.width > coin.x &&
            player.x < coin.x + 16 &&
            player.y + player.height > coin.y &&
            player.y < coin.y + 16) {
          collected.add(index)
          coinsCollectedThisFrame++
          playSound('coin')
        }
      })
      if (coinsCollectedThisFrame > 0) {
        const delta = coinsCollectedThisFrame
        setScore(prev => prev + 100 * delta)
        setCollectedCoinCount(c => c + delta)
      }

      // --- question-block collisions ---
      const questionBlocks = level_1_1.blocks.filter(b => b.type === 'question').map(b => {
        const project = level_1_1.projects.find(p => p.id === b.projectId)
        return {
          x: b.x,
          y: b.y,
          title: project?.title || 'Project',
          description: project?.description || 'Description'
        }
      })

      const hits = hitBlocksRef.current
      questionBlocks.forEach((block, index) => {
        if (!hits.has(index) &&
            player.x + player.width > block.x &&
            player.x < block.x + 32 &&
            player.y < block.y + 32 &&
            player.y + player.height > block.y &&
            player.velY < 0) {
          hits.add(index)
          setScore(prev => prev + 200)
          setBubbleText({ title: block.title, description: block.description })
          setDisplayedText({ title: '', description: '' })
          setTextAnimationIndex(0)
          setTextFullyDisplayed(false)
          setShowTextBubble(true)
          playSound('block-hit')

          blockAnimationsRef.current.push({
            id: index,
            y: block.y,
            originalY: block.y,
            animTime: 0
          })
          coinAnimationsRef.current.push({
            x: block.x + 8,
            y: block.y - 16,
            velY: -8,
            lifetime: 60
          })
        }
      })

      // --- block animations (in place, drop from tail) ---
      const blockAnims = blockAnimationsRef.current
      for (let i = blockAnims.length - 1; i >= 0; i--) {
        const anim = blockAnims[i]
        anim.animTime += 16
        if (anim.animTime < 100) {
          anim.y = anim.originalY - 8 * (1 - anim.animTime / 100)
        } else if (anim.animTime < 300) {
          const t = (anim.animTime - 100) / 200
          anim.y = anim.originalY - 8 * (1 - t)
        } else {
          anim.y = anim.originalY
          blockAnims.splice(i, 1)
        }
      }

      // --- coin animations (in place, drop from tail) ---
      const coinAnims = coinAnimationsRef.current
      for (let i = coinAnims.length - 1; i >= 0; i--) {
        const c = coinAnims[i]
        c.velY += 0.5
        c.y += c.velY
        c.lifetime -= 1
        if (c.lifetime <= 0) {
          coinAnims.splice(i, 1)
        }
      }

      // --- camera (in-place lerp) ---
      const targetX = player.x - WORLD.SCREEN_WIDTH / 2
      const clampedTargetX = Math.max(0, Math.min(targetX, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))
      camera.x = camera.x + (clampedTargetX - camera.x) * 0.1
      camera.x = Math.max(0, Math.min(camera.x, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))

      // --- background (sky) ---
      const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.SCREEN_HEIGHT)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#98FB98')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, WORLD.SCREEN_WIDTH, WORLD.SCREEN_HEIGHT)

      // --- clouds ---
      ctx.fillStyle = 'white'
      for (let i = 0; i < 10; i++) {
        const cloudX = (i * 200 + 100) - camera.x
        if (cloudX > -100 && cloudX < WORLD.SCREEN_WIDTH + 100) {
          drawCloud(ctx, cloudX, 80 + (i % 3) * 40)
        }
      }

      // --- bushes ---
      const bushes = level_1_1.decorations.filter(d => d.type === 'bush')
      bushes.forEach(bush => {
        const bushX = bush.x - camera.x
        if (bushX > -60 && bushX < WORLD.SCREEN_WIDTH) {
          drawBush(ctx, bushX, bush.y - camera.y)
        }
      })

      // --- pipes ---
      const pipes = level_1_1.pipes
      pipes.forEach(pipe => {
        const pipeX = pipe.x - camera.x
        if (pipeX > -40 && pipeX < WORLD.SCREEN_WIDTH) {
          drawPipe(ctx, pipeX, pipe.y - camera.y)
        }
      })

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
      drawPlayer(ctx, player, camera)

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

  const drawPlatforms = (ctx: CanvasRenderingContext2D, camera: { x: number; y: number }) => {
    const platforms = level_1_1.platforms
    const blockAnims = blockAnimationsRef.current
    const hits = hitBlocksRef.current
    const coinAnims = coinAnimationsRef.current
    const collected = collectedCoinsRef.current

    // Brick platforms
    ctx.fillStyle = '#8B4513'
    platforms.forEach(platform => {
      const screenX = platform.x - camera.x
      const screenY = platform.y - camera.y
      if (screenX > -platform.width && screenX < WORLD.SCREEN_WIDTH) {
        const blocksWide = platform.width / 32
        for (let i = 0; i < blocksWide; i++) {
          drawBlock(ctx, screenX + i * 32, screenY, 'brick')
        }
      }
    })

    // All blocks
    level_1_1.blocks.forEach(block => {
      const screenX = block.x - camera.x
      const screenY = block.y - camera.y

      if (screenX > -32 && screenX < WORLD.SCREEN_WIDTH) {
        if (block.type === 'question') {
          const questionIndex = level_1_1.blocks.filter(b => b.type === 'question').findIndex(b => b.x === block.x && b.y === block.y)
          const animation = blockAnims.find(a => a.id === questionIndex)
          const animatedY = animation ? animation.y : block.y
          const animatedScreenY = animatedY - camera.y

          if (hits.has(questionIndex)) {
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
    })

    // Coin animations (spawned by question-block hits)
    coinAnims.forEach(coin => {
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH && coin.lifetime > 0) {
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#FFA500'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 5, 0, Math.PI * 2)
        ctx.fill()

        if (coin.lifetime > 30) {
          ctx.fillStyle = 'white'
          ctx.font = 'bold 12px monospace'
          ctx.fillText('+200', screenX - 8, screenY - 4)
        }
      }
    })

    // Static coins
    const coins = level_1_1.coins
    coins.forEach((coin, index) => {
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH && !collected.has(index)) {
        drawCoin(ctx, screenX, screenY)
      }
    })
  }

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, camera: { x: number; y: number }) => {
    const screenX = player.x - camera.x
    const screenY = player.y - camera.y
    const pixelSize = 2

    // Save context for transformations
    ctx.save()
    
    // Apply squash effect and facing direction
    if (player.facing === 'left') {
      ctx.translate(screenX + player.width / 2, screenY + player.height)
      ctx.scale(-1, player.scaleY)
      ctx.translate(-player.width / 2, -player.height)
    } else {
      ctx.translate(screenX + player.width / 2, screenY + player.height)
      ctx.scale(1, player.scaleY)
      ctx.translate(-player.width / 2, -player.height)
    }

    const drawPixel = (x: number, y: number, color: string, width = pixelSize, height = pixelSize) => {
      ctx.fillStyle = color
      ctx.fillRect(x * pixelSize, y * pixelSize, width, height)
    }

    // Draw different sprite based on state
    if (player.spriteState === 'jump') {
      // JUMP SPRITE - arms up, legs spread
      // Helmet
      drawPixel(5, 0, '#FF8C00'); drawPixel(6, 0, '#FF8C00'); drawPixel(7, 0, '#FF8C00'); drawPixel(8, 0, '#FF8C00'); drawPixel(9, 0, '#FF8C00'); drawPixel(10, 0, '#FF8C00')
      drawPixel(4, 1, '#FF8C00'); drawPixel(5, 1, '#FF8C00'); drawPixel(6, 1, '#FF8C00'); drawPixel(7, 1, '#FF8C00'); drawPixel(8, 1, '#FF8C00'); drawPixel(9, 1, '#FF8C00'); drawPixel(10, 1, '#FF8C00'); drawPixel(11, 1, '#FF8C00')
      drawPixel(4, 2, '#FF8C00'); drawPixel(5, 2, '#FFA500'); drawPixel(6, 2, '#FFA500'); drawPixel(7, 2, '#FFA500'); drawPixel(8, 2, '#FFA500'); drawPixel(9, 2, '#FFA500'); drawPixel(10, 2, '#FFA500'); drawPixel(11, 2, '#FF8C00')
      drawPixel(4, 3, '#8B4513'); drawPixel(5, 3, '#FFE0BC'); drawPixel(6, 3, '#FFE0BC'); drawPixel(7, 3, '#FFE0BC'); drawPixel(8, 3, '#000000'); drawPixel(9, 3, '#FFE0BC'); drawPixel(10, 3, '#000000'); drawPixel(11, 3, '#8B4513')
      // Face
      drawPixel(3, 4, '#8B4513'); drawPixel(4, 4, '#FFE0BC'); drawPixel(5, 4, '#FFE0BC'); drawPixel(6, 4, '#FFE0BC'); drawPixel(7, 4, '#FFE0BC'); drawPixel(8, 4, '#000000'); drawPixel(9, 4, '#FFE0BC'); drawPixel(10, 4, '#FFE0BC'); drawPixel(11, 4, '#FFE0BC'); drawPixel(12, 4, '#8B4513')
      drawPixel(3, 5, '#8B4513'); drawPixel(4, 5, '#FFE0BC'); drawPixel(5, 5, '#FFE0BC'); drawPixel(6, 5, '#FFE0BC'); drawPixel(7, 5, '#FFE0BC'); drawPixel(8, 5, '#FFE0BC'); drawPixel(9, 5, '#FFE0BC'); drawPixel(10, 5, '#FFE0BC'); drawPixel(11, 5, '#FFE0BC'); drawPixel(12, 5, '#8B4513')
      drawPixel(3, 6, '#8B4513'); drawPixel(4, 6, '#8B4513'); drawPixel(5, 6, '#FFE0BC'); drawPixel(6, 6, '#FFE0BC'); drawPixel(7, 6, '#000000'); drawPixel(8, 6, '#000000'); drawPixel(9, 6, '#FFE0BC'); drawPixel(10, 6, '#FFE0BC'); drawPixel(11, 6, '#8B4513'); drawPixel(12, 6, '#8B4513')
      // Beard
      drawPixel(5, 7, '#8B4513'); drawPixel(6, 7, '#8B4513'); drawPixel(7, 7, '#8B4513'); drawPixel(8, 7, '#000000'); drawPixel(9, 7, '#8B4513'); drawPixel(10, 7, '#8B4513')
      drawPixel(4, 8, '#8B4513'); drawPixel(5, 8, '#8B4513'); drawPixel(6, 8, '#8B4513'); drawPixel(7, 8, '#8B4513'); drawPixel(8, 8, '#8B4513'); drawPixel(9, 8, '#8B4513'); drawPixel(10, 8, '#8B4513'); drawPixel(11, 8, '#8B4513')
      // Arms raised up
      drawPixel(1, 9, '#FFE0BC'); drawPixel(2, 9, '#FFE0BC'); drawPixel(4, 9, '#228B22'); drawPixel(5, 9, '#228B22'); drawPixel(6, 9, '#F5DEB3'); drawPixel(7, 9, '#228B22'); drawPixel(8, 9, '#228B22'); drawPixel(9, 9, '#F5DEB3'); drawPixel(10, 9, '#228B22'); drawPixel(11, 9, '#228B22'); drawPixel(13, 9, '#FFE0BC'); drawPixel(14, 9, '#FFE0BC')
      drawPixel(0, 10, '#FFE0BC'); drawPixel(1, 10, '#FFE0BC'); drawPixel(3, 10, '#228B22'); drawPixel(4, 10, '#228B22'); drawPixel(5, 10, '#228B22'); drawPixel(6, 10, '#F5DEB3'); drawPixel(7, 10, '#228B22'); drawPixel(8, 10, '#228B22'); drawPixel(9, 10, '#F5DEB3'); drawPixel(10, 10, '#228B22'); drawPixel(11, 10, '#228B22'); drawPixel(12, 10, '#228B22'); drawPixel(14, 10, '#FFE0BC'); drawPixel(15, 10, '#FFE0BC')
      // Vest
      drawPixel(3, 11, '#228B22'); drawPixel(4, 11, '#228B22'); drawPixel(5, 11, '#F5DEB3'); drawPixel(6, 11, '#F5DEB3'); drawPixel(7, 11, '#8B4513'); drawPixel(8, 11, '#8B4513'); drawPixel(9, 11, '#F5DEB3'); drawPixel(10, 11, '#F5DEB3'); drawPixel(11, 11, '#228B22'); drawPixel(12, 11, '#228B22')
      drawPixel(3, 12, '#F5DEB3'); drawPixel(4, 12, '#F5DEB3'); drawPixel(5, 12, '#8B4513'); drawPixel(6, 12, '#F5DEB3'); drawPixel(7, 12, '#8B4513'); drawPixel(8, 12, '#8B4513'); drawPixel(9, 12, '#8B4513'); drawPixel(10, 12, '#F5DEB3'); drawPixel(11, 12, '#F5DEB3'); drawPixel(12, 12, '#F5DEB3')
      // Pants - legs spread
      drawPixel(3, 13, '#8B4513'); drawPixel(4, 13, '#8B4513'); drawPixel(5, 13, '#8B4513'); drawPixel(6, 13, '#8B4513'); drawPixel(9, 13, '#8B4513'); drawPixel(10, 13, '#8B4513'); drawPixel(11, 13, '#8B4513'); drawPixel(12, 13, '#8B4513')
      drawPixel(2, 14, '#8B4513'); drawPixel(3, 14, '#8B4513'); drawPixel(4, 14, '#8B4513'); drawPixel(5, 14, '#8B4513'); drawPixel(10, 14, '#8B4513'); drawPixel(11, 14, '#8B4513'); drawPixel(12, 14, '#8B4513'); drawPixel(13, 14, '#8B4513')
      drawPixel(1, 15, '#8B4513'); drawPixel(2, 15, '#8B4513'); drawPixel(3, 15, '#8B4513'); drawPixel(12, 15, '#8B4513'); drawPixel(13, 15, '#8B4513'); drawPixel(14, 15, '#8B4513')
      // Legs spread
      drawPixel(0, 16, '#FFE0BC'); drawPixel(1, 16, '#FFE0BC'); drawPixel(2, 16, '#FFE0BC'); drawPixel(13, 16, '#FFE0BC'); drawPixel(14, 16, '#FFE0BC'); drawPixel(15, 16, '#FFE0BC')
      drawPixel(0, 17, '#FFE0BC'); drawPixel(1, 17, '#FFE0BC'); drawPixel(14, 17, '#FFE0BC'); drawPixel(15, 17, '#FFE0BC')
      // Boots spread
      drawPixel(0, 18, '#2F4F4F'); drawPixel(1, 18, '#2F4F4F'); drawPixel(14, 18, '#2F4F4F'); drawPixel(15, 18, '#2F4F4F')
      drawPixel(0, 19, '#2F4F4F'); drawPixel(1, 19, '#2F4F4F'); drawPixel(14, 19, '#2F4F4F'); drawPixel(15, 19, '#2F4F4F')
      
    } else if (player.spriteState === 'walk1') {
      // WALK FRAME 1 - left leg forward
      // Helmet
      drawPixel(5, 0, '#FF8C00'); drawPixel(6, 0, '#FF8C00'); drawPixel(7, 0, '#FF8C00'); drawPixel(8, 0, '#FF8C00'); drawPixel(9, 0, '#FF8C00'); drawPixel(10, 0, '#FF8C00')
      drawPixel(4, 1, '#FF8C00'); drawPixel(5, 1, '#FF8C00'); drawPixel(6, 1, '#FF8C00'); drawPixel(7, 1, '#FF8C00'); drawPixel(8, 1, '#FF8C00'); drawPixel(9, 1, '#FF8C00'); drawPixel(10, 1, '#FF8C00'); drawPixel(11, 1, '#FF8C00')
      drawPixel(4, 2, '#FF8C00'); drawPixel(5, 2, '#FFA500'); drawPixel(6, 2, '#FFA500'); drawPixel(7, 2, '#FFA500'); drawPixel(8, 2, '#FFA500'); drawPixel(9, 2, '#FFA500'); drawPixel(10, 2, '#FFA500'); drawPixel(11, 2, '#FF8C00')
      drawPixel(4, 3, '#8B4513'); drawPixel(5, 3, '#FFE0BC'); drawPixel(6, 3, '#FFE0BC'); drawPixel(7, 3, '#FFE0BC'); drawPixel(8, 3, '#000000'); drawPixel(9, 3, '#FFE0BC'); drawPixel(10, 3, '#000000'); drawPixel(11, 3, '#8B4513')
      // Face
      drawPixel(3, 4, '#8B4513'); drawPixel(4, 4, '#FFE0BC'); drawPixel(5, 4, '#FFE0BC'); drawPixel(6, 4, '#FFE0BC'); drawPixel(7, 4, '#FFE0BC'); drawPixel(8, 4, '#000000'); drawPixel(9, 4, '#FFE0BC'); drawPixel(10, 4, '#FFE0BC'); drawPixel(11, 4, '#FFE0BC'); drawPixel(12, 4, '#8B4513')
      drawPixel(3, 5, '#8B4513'); drawPixel(4, 5, '#FFE0BC'); drawPixel(5, 5, '#FFE0BC'); drawPixel(6, 5, '#FFE0BC'); drawPixel(7, 5, '#FFE0BC'); drawPixel(8, 5, '#FFE0BC'); drawPixel(9, 5, '#FFE0BC'); drawPixel(10, 5, '#FFE0BC'); drawPixel(11, 5, '#FFE0BC'); drawPixel(12, 5, '#8B4513')
      drawPixel(3, 6, '#8B4513'); drawPixel(4, 6, '#8B4513'); drawPixel(5, 6, '#FFE0BC'); drawPixel(6, 6, '#FFE0BC'); drawPixel(7, 6, '#000000'); drawPixel(8, 6, '#000000'); drawPixel(9, 6, '#FFE0BC'); drawPixel(10, 6, '#FFE0BC'); drawPixel(11, 6, '#8B4513'); drawPixel(12, 6, '#8B4513')
      // Beard
      drawPixel(5, 7, '#8B4513'); drawPixel(6, 7, '#8B4513'); drawPixel(7, 7, '#8B4513'); drawPixel(8, 7, '#000000'); drawPixel(9, 7, '#8B4513'); drawPixel(10, 7, '#8B4513')
      drawPixel(4, 8, '#8B4513'); drawPixel(5, 8, '#8B4513'); drawPixel(6, 8, '#8B4513'); drawPixel(7, 8, '#8B4513'); drawPixel(8, 8, '#8B4513'); drawPixel(9, 8, '#8B4513'); drawPixel(10, 8, '#8B4513'); drawPixel(11, 8, '#8B4513')
      // Vest with arms swinging
      drawPixel(2, 9, '#FFE0BC'); drawPixel(4, 9, '#228B22'); drawPixel(5, 9, '#228B22'); drawPixel(6, 9, '#F5DEB3'); drawPixel(7, 9, '#228B22'); drawPixel(8, 9, '#228B22'); drawPixel(9, 9, '#F5DEB3'); drawPixel(10, 9, '#228B22'); drawPixel(11, 9, '#228B22')
      drawPixel(1, 10, '#FFE0BC'); drawPixel(2, 10, '#FFE0BC'); drawPixel(3, 10, '#228B22'); drawPixel(4, 10, '#228B22'); drawPixel(5, 10, '#228B22'); drawPixel(6, 10, '#F5DEB3'); drawPixel(7, 10, '#228B22'); drawPixel(8, 10, '#228B22'); drawPixel(9, 10, '#F5DEB3'); drawPixel(10, 10, '#228B22'); drawPixel(11, 10, '#228B22'); drawPixel(12, 10, '#228B22'); drawPixel(13, 10, '#FFE0BC')
      drawPixel(3, 11, '#228B22'); drawPixel(4, 11, '#228B22'); drawPixel(5, 11, '#F5DEB3'); drawPixel(6, 11, '#F5DEB3'); drawPixel(7, 11, '#8B4513'); drawPixel(8, 11, '#8B4513'); drawPixel(9, 11, '#F5DEB3'); drawPixel(10, 11, '#F5DEB3'); drawPixel(11, 11, '#228B22'); drawPixel(12, 11, '#228B22'); drawPixel(13, 11, '#FFE0BC'); drawPixel(14, 11, '#FFE0BC')
      drawPixel(2, 12, '#F5DEB3'); drawPixel(3, 12, '#F5DEB3'); drawPixel(4, 12, '#F5DEB3'); drawPixel(5, 12, '#8B4513'); drawPixel(6, 12, '#F5DEB3'); drawPixel(7, 12, '#8B4513'); drawPixel(8, 12, '#8B4513'); drawPixel(9, 12, '#8B4513'); drawPixel(10, 12, '#F5DEB3'); drawPixel(11, 12, '#F5DEB3'); drawPixel(12, 12, '#F5DEB3'); drawPixel(13, 12, '#F5DEB3')
      // Pants - walking pose
      drawPixel(3, 13, '#8B4513'); drawPixel(4, 13, '#8B4513'); drawPixel(5, 13, '#8B4513'); drawPixel(6, 13, '#8B4513'); drawPixel(7, 13, '#8B4513'); drawPixel(8, 13, '#8B4513'); drawPixel(9, 13, '#8B4513'); drawPixel(10, 13, '#8B4513'); drawPixel(11, 13, '#8B4513'); drawPixel(12, 13, '#8B4513')
      drawPixel(2, 14, '#8B4513'); drawPixel(3, 14, '#8B4513'); drawPixel(4, 14, '#8B4513'); drawPixel(5, 14, '#8B4513'); drawPixel(6, 14, '#8B4513'); drawPixel(9, 14, '#8B4513'); drawPixel(10, 14, '#8B4513'); drawPixel(11, 14, '#8B4513'); drawPixel(12, 14, '#8B4513')
      drawPixel(1, 15, '#8B4513'); drawPixel(2, 15, '#8B4513'); drawPixel(3, 15, '#8B4513'); drawPixel(4, 15, '#8B4513'); drawPixel(10, 15, '#8B4513'); drawPixel(11, 15, '#8B4513'); drawPixel(12, 15, '#8B4513')
      // Legs - left forward
      drawPixel(0, 16, '#FFE0BC'); drawPixel(1, 16, '#FFE0BC'); drawPixel(2, 16, '#FFE0BC'); drawPixel(3, 16, '#FFE0BC'); drawPixel(11, 16, '#FFE0BC'); drawPixel(12, 16, '#FFE0BC')
      drawPixel(0, 17, '#FFE0BC'); drawPixel(1, 17, '#FFE0BC'); drawPixel(2, 17, '#FFE0BC'); drawPixel(11, 17, '#FFE0BC'); drawPixel(12, 17, '#FFE0BC')
      // Boots
      drawPixel(0, 18, '#2F4F4F'); drawPixel(1, 18, '#2F4F4F'); drawPixel(2, 18, '#2F4F4F'); drawPixel(10, 18, '#2F4F4F'); drawPixel(11, 18, '#2F4F4F'); drawPixel(12, 18, '#2F4F4F')
      drawPixel(0, 19, '#2F4F4F'); drawPixel(1, 19, '#2F4F4F'); drawPixel(2, 19, '#2F4F4F'); drawPixel(3, 19, '#2F4F4F'); drawPixel(10, 19, '#2F4F4F'); drawPixel(11, 19, '#2F4F4F'); drawPixel(12, 19, '#2F4F4F'); drawPixel(13, 19, '#2F4F4F')
      drawPixel(0, 20, '#2F4F4F'); drawPixel(1, 20, '#2F4F4F'); drawPixel(2, 20, '#2F4F4F'); drawPixel(3, 20, '#2F4F4F'); drawPixel(10, 20, '#2F4F4F'); drawPixel(11, 20, '#2F4F4F'); drawPixel(12, 20, '#2F4F4F'); drawPixel(13, 20, '#2F4F4F')

    } else if (player.spriteState === 'walk2') {
      // WALK FRAME 2 - right leg forward
      // Helmet
      drawPixel(5, 0, '#FF8C00'); drawPixel(6, 0, '#FF8C00'); drawPixel(7, 0, '#FF8C00'); drawPixel(8, 0, '#FF8C00'); drawPixel(9, 0, '#FF8C00'); drawPixel(10, 0, '#FF8C00')
      drawPixel(4, 1, '#FF8C00'); drawPixel(5, 1, '#FF8C00'); drawPixel(6, 1, '#FF8C00'); drawPixel(7, 1, '#FF8C00'); drawPixel(8, 1, '#FF8C00'); drawPixel(9, 1, '#FF8C00'); drawPixel(10, 1, '#FF8C00'); drawPixel(11, 1, '#FF8C00')
      drawPixel(4, 2, '#FF8C00'); drawPixel(5, 2, '#FFA500'); drawPixel(6, 2, '#FFA500'); drawPixel(7, 2, '#FFA500'); drawPixel(8, 2, '#FFA500'); drawPixel(9, 2, '#FFA500'); drawPixel(10, 2, '#FFA500'); drawPixel(11, 2, '#FF8C00')
      drawPixel(4, 3, '#8B4513'); drawPixel(5, 3, '#FFE0BC'); drawPixel(6, 3, '#FFE0BC'); drawPixel(7, 3, '#FFE0BC'); drawPixel(8, 3, '#000000'); drawPixel(9, 3, '#FFE0BC'); drawPixel(10, 3, '#000000'); drawPixel(11, 3, '#8B4513')
      // Face
      drawPixel(3, 4, '#8B4513'); drawPixel(4, 4, '#FFE0BC'); drawPixel(5, 4, '#FFE0BC'); drawPixel(6, 4, '#FFE0BC'); drawPixel(7, 4, '#FFE0BC'); drawPixel(8, 4, '#000000'); drawPixel(9, 4, '#FFE0BC'); drawPixel(10, 4, '#FFE0BC'); drawPixel(11, 4, '#FFE0BC'); drawPixel(12, 4, '#8B4513')
      drawPixel(3, 5, '#8B4513'); drawPixel(4, 5, '#FFE0BC'); drawPixel(5, 5, '#FFE0BC'); drawPixel(6, 5, '#FFE0BC'); drawPixel(7, 5, '#FFE0BC'); drawPixel(8, 5, '#FFE0BC'); drawPixel(9, 5, '#FFE0BC'); drawPixel(10, 5, '#FFE0BC'); drawPixel(11, 5, '#FFE0BC'); drawPixel(12, 5, '#8B4513')
      drawPixel(3, 6, '#8B4513'); drawPixel(4, 6, '#8B4513'); drawPixel(5, 6, '#FFE0BC'); drawPixel(6, 6, '#FFE0BC'); drawPixel(7, 6, '#000000'); drawPixel(8, 6, '#000000'); drawPixel(9, 6, '#FFE0BC'); drawPixel(10, 6, '#FFE0BC'); drawPixel(11, 6, '#8B4513'); drawPixel(12, 6, '#8B4513')
      // Beard
      drawPixel(5, 7, '#8B4513'); drawPixel(6, 7, '#8B4513'); drawPixel(7, 7, '#8B4513'); drawPixel(8, 7, '#000000'); drawPixel(9, 7, '#8B4513'); drawPixel(10, 7, '#8B4513')
      drawPixel(4, 8, '#8B4513'); drawPixel(5, 8, '#8B4513'); drawPixel(6, 8, '#8B4513'); drawPixel(7, 8, '#8B4513'); drawPixel(8, 8, '#8B4513'); drawPixel(9, 8, '#8B4513'); drawPixel(10, 8, '#8B4513'); drawPixel(11, 8, '#8B4513')
      // Vest with opposite arm swing
      drawPixel(4, 9, '#228B22'); drawPixel(5, 9, '#228B22'); drawPixel(6, 9, '#F5DEB3'); drawPixel(7, 9, '#228B22'); drawPixel(8, 9, '#228B22'); drawPixel(9, 9, '#F5DEB3'); drawPixel(10, 9, '#228B22'); drawPixel(11, 9, '#228B22'); drawPixel(13, 9, '#FFE0BC')
      drawPixel(2, 10, '#FFE0BC'); drawPixel(3, 10, '#228B22'); drawPixel(4, 10, '#228B22'); drawPixel(5, 10, '#228B22'); drawPixel(6, 10, '#F5DEB3'); drawPixel(7, 10, '#228B22'); drawPixel(8, 10, '#228B22'); drawPixel(9, 10, '#F5DEB3'); drawPixel(10, 10, '#228B22'); drawPixel(11, 10, '#228B22'); drawPixel(12, 10, '#228B22'); drawPixel(13, 10, '#FFE0BC'); drawPixel(14, 10, '#FFE0BC')
      drawPixel(1, 11, '#FFE0BC'); drawPixel(2, 11, '#FFE0BC'); drawPixel(3, 11, '#228B22'); drawPixel(4, 11, '#228B22'); drawPixel(5, 11, '#F5DEB3'); drawPixel(6, 11, '#F5DEB3'); drawPixel(7, 11, '#8B4513'); drawPixel(8, 11, '#8B4513'); drawPixel(9, 11, '#F5DEB3'); drawPixel(10, 11, '#F5DEB3'); drawPixel(11, 11, '#228B22'); drawPixel(12, 11, '#228B22')
      drawPixel(2, 12, '#F5DEB3'); drawPixel(3, 12, '#F5DEB3'); drawPixel(4, 12, '#F5DEB3'); drawPixel(5, 12, '#8B4513'); drawPixel(6, 12, '#F5DEB3'); drawPixel(7, 12, '#8B4513'); drawPixel(8, 12, '#8B4513'); drawPixel(9, 12, '#8B4513'); drawPixel(10, 12, '#F5DEB3'); drawPixel(11, 12, '#F5DEB3'); drawPixel(12, 12, '#F5DEB3'); drawPixel(13, 12, '#F5DEB3')
      // Pants - walking pose opposite
      drawPixel(3, 13, '#8B4513'); drawPixel(4, 13, '#8B4513'); drawPixel(5, 13, '#8B4513'); drawPixel(6, 13, '#8B4513'); drawPixel(7, 13, '#8B4513'); drawPixel(8, 13, '#8B4513'); drawPixel(9, 13, '#8B4513'); drawPixel(10, 13, '#8B4513'); drawPixel(11, 13, '#8B4513'); drawPixel(12, 13, '#8B4513')
      drawPixel(3, 14, '#8B4513'); drawPixel(4, 14, '#8B4513'); drawPixel(5, 14, '#8B4513'); drawPixel(6, 14, '#8B4513'); drawPixel(9, 14, '#8B4513'); drawPixel(10, 14, '#8B4513'); drawPixel(11, 14, '#8B4513'); drawPixel(12, 14, '#8B4513'); drawPixel(13, 14, '#8B4513')
      drawPixel(3, 15, '#8B4513'); drawPixel(4, 15, '#8B4513'); drawPixel(5, 15, '#8B4513'); drawPixel(11, 15, '#8B4513'); drawPixel(12, 15, '#8B4513'); drawPixel(13, 15, '#8B4513'); drawPixel(14, 15, '#8B4513')
      // Legs - right forward
      drawPixel(3, 16, '#FFE0BC'); drawPixel(4, 16, '#FFE0BC'); drawPixel(12, 16, '#FFE0BC'); drawPixel(13, 16, '#FFE0BC'); drawPixel(14, 16, '#FFE0BC'); drawPixel(15, 16, '#FFE0BC')
      drawPixel(3, 17, '#FFE0BC'); drawPixel(4, 17, '#FFE0BC'); drawPixel(13, 17, '#FFE0BC'); drawPixel(14, 17, '#FFE0BC'); drawPixel(15, 17, '#FFE0BC')
      // Boots
      drawPixel(3, 18, '#2F4F4F'); drawPixel(4, 18, '#2F4F4F'); drawPixel(5, 18, '#2F4F4F'); drawPixel(13, 18, '#2F4F4F'); drawPixel(14, 18, '#2F4F4F'); drawPixel(15, 18, '#2F4F4F')
      drawPixel(2, 19, '#2F4F4F'); drawPixel(3, 19, '#2F4F4F'); drawPixel(4, 19, '#2F4F4F'); drawPixel(5, 19, '#2F4F4F'); drawPixel(12, 19, '#2F4F4F'); drawPixel(13, 19, '#2F4F4F'); drawPixel(14, 19, '#2F4F4F'); drawPixel(15, 19, '#2F4F4F')
      drawPixel(2, 20, '#2F4F4F'); drawPixel(3, 20, '#2F4F4F'); drawPixel(4, 20, '#2F4F4F'); drawPixel(5, 20, '#2F4F4F'); drawPixel(12, 20, '#2F4F4F'); drawPixel(13, 20, '#2F4F4F'); drawPixel(14, 20, '#2F4F4F'); drawPixel(15, 20, '#2F4F4F')

    } else {
      // IDLE SPRITE - standing still
      // Helmet
      drawPixel(5, 0, '#FF8C00'); drawPixel(6, 0, '#FF8C00'); drawPixel(7, 0, '#FF8C00'); drawPixel(8, 0, '#FF8C00'); drawPixel(9, 0, '#FF8C00'); drawPixel(10, 0, '#FF8C00')
      drawPixel(4, 1, '#FF8C00'); drawPixel(5, 1, '#FF8C00'); drawPixel(6, 1, '#FF8C00'); drawPixel(7, 1, '#FF8C00'); drawPixel(8, 1, '#FF8C00'); drawPixel(9, 1, '#FF8C00'); drawPixel(10, 1, '#FF8C00'); drawPixel(11, 1, '#FF8C00')
      drawPixel(4, 2, '#FF8C00'); drawPixel(5, 2, '#FFA500'); drawPixel(6, 2, '#FFA500'); drawPixel(7, 2, '#FFA500'); drawPixel(8, 2, '#FFA500'); drawPixel(9, 2, '#FFA500'); drawPixel(10, 2, '#FFA500'); drawPixel(11, 2, '#FF8C00')
      drawPixel(4, 3, '#8B4513'); drawPixel(5, 3, '#FFE0BC'); drawPixel(6, 3, '#FFE0BC'); drawPixel(7, 3, '#FFE0BC'); drawPixel(8, 3, '#000000'); drawPixel(9, 3, '#FFE0BC'); drawPixel(10, 3, '#000000'); drawPixel(11, 3, '#8B4513')
      // Face
      drawPixel(3, 4, '#8B4513'); drawPixel(4, 4, '#FFE0BC'); drawPixel(5, 4, '#FFE0BC'); drawPixel(6, 4, '#FFE0BC'); drawPixel(7, 4, '#FFE0BC'); drawPixel(8, 4, '#000000'); drawPixel(9, 4, '#FFE0BC'); drawPixel(10, 4, '#FFE0BC'); drawPixel(11, 4, '#FFE0BC'); drawPixel(12, 4, '#8B4513')
      drawPixel(3, 5, '#8B4513'); drawPixel(4, 5, '#FFE0BC'); drawPixel(5, 5, '#FFE0BC'); drawPixel(6, 5, '#FFE0BC'); drawPixel(7, 5, '#FFE0BC'); drawPixel(8, 5, '#FFE0BC'); drawPixel(9, 5, '#FFE0BC'); drawPixel(10, 5, '#FFE0BC'); drawPixel(11, 5, '#FFE0BC'); drawPixel(12, 5, '#8B4513')
      drawPixel(3, 6, '#8B4513'); drawPixel(4, 6, '#8B4513'); drawPixel(5, 6, '#FFE0BC'); drawPixel(6, 6, '#FFE0BC'); drawPixel(7, 6, '#000000'); drawPixel(8, 6, '#000000'); drawPixel(9, 6, '#FFE0BC'); drawPixel(10, 6, '#FFE0BC'); drawPixel(11, 6, '#8B4513'); drawPixel(12, 6, '#8B4513')
      // Beard
      drawPixel(5, 7, '#8B4513'); drawPixel(6, 7, '#8B4513'); drawPixel(7, 7, '#8B4513'); drawPixel(8, 7, '#000000'); drawPixel(9, 7, '#8B4513'); drawPixel(10, 7, '#8B4513')
      drawPixel(4, 8, '#8B4513'); drawPixel(5, 8, '#8B4513'); drawPixel(6, 8, '#8B4513'); drawPixel(7, 8, '#8B4513'); drawPixel(8, 8, '#8B4513'); drawPixel(9, 8, '#8B4513'); drawPixel(10, 8, '#8B4513'); drawPixel(11, 8, '#8B4513')
      // Vest
      drawPixel(4, 9, '#228B22'); drawPixel(5, 9, '#228B22'); drawPixel(6, 9, '#F5DEB3'); drawPixel(7, 9, '#228B22'); drawPixel(8, 9, '#228B22'); drawPixel(9, 9, '#F5DEB3'); drawPixel(10, 9, '#228B22'); drawPixel(11, 9, '#228B22')
      drawPixel(3, 10, '#228B22'); drawPixel(4, 10, '#228B22'); drawPixel(5, 10, '#228B22'); drawPixel(6, 10, '#F5DEB3'); drawPixel(7, 10, '#228B22'); drawPixel(8, 10, '#228B22'); drawPixel(9, 10, '#F5DEB3'); drawPixel(10, 10, '#228B22'); drawPixel(11, 10, '#228B22'); drawPixel(12, 10, '#228B22')
      drawPixel(3, 11, '#228B22'); drawPixel(4, 11, '#228B22'); drawPixel(5, 11, '#F5DEB3'); drawPixel(6, 11, '#F5DEB3'); drawPixel(7, 11, '#8B4513'); drawPixel(8, 11, '#8B4513'); drawPixel(9, 11, '#F5DEB3'); drawPixel(10, 11, '#F5DEB3'); drawPixel(11, 11, '#228B22'); drawPixel(12, 11, '#228B22')
      drawPixel(2, 12, '#F5DEB3'); drawPixel(3, 12, '#F5DEB3'); drawPixel(4, 12, '#F5DEB3'); drawPixel(5, 12, '#8B4513'); drawPixel(6, 12, '#F5DEB3'); drawPixel(7, 12, '#8B4513'); drawPixel(8, 12, '#8B4513'); drawPixel(9, 12, '#8B4513'); drawPixel(10, 12, '#F5DEB3'); drawPixel(11, 12, '#F5DEB3'); drawPixel(12, 12, '#F5DEB3'); drawPixel(13, 12, '#F5DEB3')
      // Pants
      drawPixel(2, 13, '#8B4513'); drawPixel(3, 13, '#8B4513'); drawPixel(4, 13, '#8B4513'); drawPixel(5, 13, '#8B4513'); drawPixel(6, 13, '#8B4513'); drawPixel(7, 13, '#8B4513'); drawPixel(8, 13, '#8B4513'); drawPixel(9, 13, '#8B4513'); drawPixel(10, 13, '#8B4513'); drawPixel(11, 13, '#8B4513'); drawPixel(12, 13, '#8B4513'); drawPixel(13, 13, '#8B4513')
      drawPixel(2, 14, '#8B4513'); drawPixel(3, 14, '#8B4513'); drawPixel(4, 14, '#8B4513'); drawPixel(5, 14, '#8B4513'); drawPixel(6, 14, '#8B4513'); drawPixel(7, 14, '#8B4513'); drawPixel(8, 14, '#8B4513'); drawPixel(9, 14, '#8B4513'); drawPixel(10, 14, '#8B4513'); drawPixel(11, 14, '#8B4513'); drawPixel(12, 14, '#8B4513'); drawPixel(13, 14, '#8B4513')
      drawPixel(2, 15, '#FFE0BC'); drawPixel(3, 15, '#FFE0BC'); drawPixel(4, 15, '#8B4513'); drawPixel(5, 15, '#8B4513'); drawPixel(6, 15, '#8B4513'); drawPixel(7, 15, '#8B4513'); drawPixel(8, 15, '#8B4513'); drawPixel(9, 15, '#8B4513'); drawPixel(10, 15, '#8B4513'); drawPixel(11, 15, '#8B4513'); drawPixel(12, 15, '#FFE0BC'); drawPixel(13, 15, '#FFE0BC')
      // Legs
      drawPixel(2, 16, '#FFE0BC'); drawPixel(3, 16, '#FFE0BC'); drawPixel(4, 16, '#FFE0BC'); drawPixel(5, 16, '#FFE0BC'); drawPixel(6, 16, '#8B4513'); drawPixel(7, 16, '#8B4513'); drawPixel(8, 16, '#8B4513'); drawPixel(9, 16, '#8B4513'); drawPixel(10, 16, '#FFE0BC'); drawPixel(11, 16, '#FFE0BC'); drawPixel(12, 16, '#FFE0BC'); drawPixel(13, 16, '#FFE0BC')
      drawPixel(2, 17, '#FFE0BC'); drawPixel(3, 17, '#FFE0BC'); drawPixel(4, 17, '#FFE0BC'); drawPixel(5, 17, '#FFE0BC'); drawPixel(6, 17, '#8B4513'); drawPixel(7, 17, '#8B4513'); drawPixel(8, 17, '#8B4513'); drawPixel(9, 17, '#8B4513'); drawPixel(10, 17, '#FFE0BC'); drawPixel(11, 17, '#FFE0BC'); drawPixel(12, 17, '#FFE0BC'); drawPixel(13, 17, '#FFE0BC')
      // Boots
      drawPixel(1, 18, '#2F4F4F'); drawPixel(2, 18, '#2F4F4F'); drawPixel(3, 18, '#2F4F4F'); drawPixel(4, 18, '#2F4F4F'); drawPixel(5, 18, '#2F4F4F'); drawPixel(10, 18, '#2F4F4F'); drawPixel(11, 18, '#2F4F4F'); drawPixel(12, 18, '#2F4F4F'); drawPixel(13, 18, '#2F4F4F'); drawPixel(14, 18, '#2F4F4F')
      drawPixel(0, 19, '#2F4F4F'); drawPixel(1, 19, '#2F4F4F'); drawPixel(2, 19, '#2F4F4F'); drawPixel(3, 19, '#2F4F4F'); drawPixel(4, 19, '#2F4F4F'); drawPixel(5, 19, '#2F4F4F'); drawPixel(10, 19, '#2F4F4F'); drawPixel(11, 19, '#2F4F4F'); drawPixel(12, 19, '#2F4F4F'); drawPixel(13, 19, '#2F4F4F'); drawPixel(14, 19, '#2F4F4F'); drawPixel(15, 19, '#2F4F4F')
      drawPixel(0, 20, '#2F4F4F'); drawPixel(1, 20, '#2F4F4F'); drawPixel(2, 20, '#2F4F4F'); drawPixel(3, 20, '#2F4F4F'); drawPixel(4, 20, '#2F4F4F'); drawPixel(5, 20, '#2F4F4F'); drawPixel(10, 20, '#2F4F4F'); drawPixel(11, 20, '#2F4F4F'); drawPixel(12, 20, '#2F4F4F'); drawPixel(13, 20, '#2F4F4F'); drawPixel(14, 20, '#2F4F4F'); drawPixel(15, 20, '#2F4F4F')
      drawPixel(0, 21, '#2F4F4F'); drawPixel(1, 21, '#2F4F4F'); drawPixel(2, 21, '#2F4F4F'); drawPixel(3, 21, '#2F4F4F'); drawPixel(4, 21, '#2F4F4F'); drawPixel(5, 21, '#2F4F4F'); drawPixel(10, 21, '#2F4F4F'); drawPixel(11, 21, '#2F4F4F'); drawPixel(12, 21, '#2F4F4F'); drawPixel(13, 21, '#2F4F4F'); drawPixel(14, 21, '#2F4F4F'); drawPixel(15, 21, '#2F4F4F')
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