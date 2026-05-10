'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
  WORLD_WIDTH: 3200,
  GROUND_HEIGHT: 450
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
  
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: WORLD.GROUND_HEIGHT - 64,
    width: 32,
    height: 64,
    velX: 0,
    velY: 0,
    targetVelX: 0,
    onGround: true,
    facing: 'right',
    animationFrame: 0,
    spriteState: 'idle',
    lastGroundTime: Date.now(),
    jumpHoldTime: 0,
    isJumpHeld: false,
    squashTime: 0,
    scaleY: 1
  })

  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [collectedCoins, setCollectedCoins] = useState<Set<number>>(new Set())
  const [hitBlocks, setHitBlocks] = useState<Set<number>>(new Set())
  const [blockAnimations, setBlockAnimations] = useState<BlockAnimation[]>([])
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([])
  const [showTextBubble, setShowTextBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState({ title: '', description: '' })
  const [displayedText, setDisplayedText] = useState({ title: '', description: '' })
  const [textAnimationIndex, setTextAnimationIndex] = useState(0)
  const [textFullyDisplayed, setTextFullyDisplayed] = useState(false)

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

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, WORLD.SCREEN_WIDTH, WORLD.SCREEN_HEIGHT)

      // Update player
      setPlayer(prevPlayer => {
        const newPlayer = { ...prevPlayer }
        const keys = keysRef.current
        const now = Date.now()

        // Update animation frame counter
        newPlayer.animationFrame = (newPlayer.animationFrame + 1) % 16 // Cycle every 16 frames

        // Update squash animation
        if (newPlayer.squashTime > 0) {
          newPlayer.squashTime -= 16 // Approx frame time
          if (newPlayer.squashTime <= 0) {
            newPlayer.scaleY = 1
            newPlayer.squashTime = 0
          } else {
            newPlayer.scaleY = 0.9 // Squashed height
          }
        }

        // Input handling with acceleration/deceleration
        if (!showTextBubble) {  // Only process movement when bubble not shown
          if (keys.has('ArrowLeft') || keys.has('KeyA')) {
            newPlayer.targetVelX = -PHYSICS.MOVE_SPEED
            newPlayer.facing = 'left'
          } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
            newPlayer.targetVelX = PHYSICS.MOVE_SPEED
            newPlayer.facing = 'right'
          } else {
            newPlayer.targetVelX = 0
          }

          // Smooth acceleration/deceleration
          const diff = newPlayer.targetVelX - newPlayer.velX
          if (Math.abs(diff) > 0.1) {
            newPlayer.velX += diff * PHYSICS.ACCELERATION
          } else {
            newPlayer.velX = newPlayer.targetVelX
          }
        } else {
          // Stop movement when text bubble is shown
          newPlayer.targetVelX = 0
          newPlayer.velX *= PHYSICS.FRICTION
        }

        // Jumping with coyote time and variable height
        const jumpPressed = keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')
        const canJump = newPlayer.onGround || (now - newPlayer.lastGroundTime < PHYSICS.COYOTE_TIME)
        
        if (jumpPressed && canJump && !showTextBubble && !newPlayer.isJumpHeld) {
          newPlayer.velY = PHYSICS.JUMP_VELOCITY
          newPlayer.onGround = false
          newPlayer.isJumpHeld = true
          newPlayer.jumpHoldTime = 0
        }

        // Variable jump height - reduce gravity while holding jump
        if (jumpPressed && newPlayer.isJumpHeld && newPlayer.velY < 0) {
          newPlayer.jumpHoldTime += 16 // Approx frame time
          if (newPlayer.jumpHoldTime < PHYSICS.MAX_JUMP_HOLD) {
            // Apply reduced gravity for higher jump
            newPlayer.velY += PHYSICS.GRAVITY_REDUCED
          } else {
            // Max hold time reached
            newPlayer.velY += PHYSICS.GRAVITY
          }
        } else {
          // Normal gravity
          if (!newPlayer.onGround) {
            newPlayer.velY += PHYSICS.GRAVITY
          }
        }

        // Reset jump hold when button released
        if (!jumpPressed) {
          newPlayer.isJumpHeld = false
          newPlayer.jumpHoldTime = 0
        }

        // Cap fall speed
        if (newPlayer.velY > PHYSICS.MAX_FALL_SPEED) {
          newPlayer.velY = PHYSICS.MAX_FALL_SPEED
        }

        // Update position
        newPlayer.x += newPlayer.velX
        newPlayer.y += newPlayer.velY

        // Track last ground time for coyote time
        if (newPlayer.onGround) {
          newPlayer.lastGroundTime = now
        }

        // Determine sprite state based on movement
        if (!newPlayer.onGround) {
          // In the air - jumping or falling
          newPlayer.spriteState = 'jump'
        } else if (Math.abs(newPlayer.velX) > 0.5) {
          // Walking - alternate between walk frames every 8 frames
          newPlayer.spriteState = Math.floor(newPlayer.animationFrame / 8) % 2 === 0 ? 'walk1' : 'walk2'
        } else {
          // Standing still
          newPlayer.spriteState = 'idle'
        }

        // Bounds checking
        if (newPlayer.x < 0) {
          newPlayer.x = 0
          newPlayer.velX = 0
        }
        if (newPlayer.x > WORLD.WORLD_WIDTH - newPlayer.width) {
          newPlayer.x = WORLD.WORLD_WIDTH - newPlayer.width
          newPlayer.velX = 0
        }

        // Platform collision detection
        const platforms = [
          { x: 400, y: 350, width: 128, height: 32 },
          { x: 600, y: 300, width: 96, height: 32 },
          { x: 900, y: 280, width: 160, height: 32 },
        ]

        // Check platform collisions
        let onPlatform = false
        const wasAirborne = !newPlayer.onGround && newPlayer.velY > 0
        
        platforms.forEach(platform => {
          // Check if player is above platform and falling down
          if (newPlayer.x + newPlayer.width > platform.x &&
              newPlayer.x < platform.x + platform.width &&
              newPlayer.y + newPlayer.height <= platform.y + 10 &&
              newPlayer.y + newPlayer.height >= platform.y - 10 &&
              newPlayer.velY >= 0) {
            newPlayer.y = platform.y - newPlayer.height
            newPlayer.velY = 0
            
            // Trigger squash on landing
            if (wasAirborne && !newPlayer.onGround) {
              newPlayer.squashTime = 80
              newPlayer.scaleY = 0.9
            }
            
            newPlayer.onGround = true
            onPlatform = true
          }
        })

        // Ground collision
        if (newPlayer.y + newPlayer.height >= WORLD.GROUND_HEIGHT) {
          newPlayer.y = WORLD.GROUND_HEIGHT - newPlayer.height
          newPlayer.velY = 0
          
          // Trigger squash on landing
          if (wasAirborne && !newPlayer.onGround) {
            newPlayer.squashTime = 80
            newPlayer.scaleY = 0.9
          }
          
          newPlayer.onGround = true
        } else if (!onPlatform && newPlayer.y + newPlayer.height < WORLD.GROUND_HEIGHT) {
          newPlayer.onGround = false
        }

        return newPlayer
      })

      // Check coin collisions
      setCollectedCoins(prevCollected => {
        const coins = [
          { x: 250, y: 420 },
          { x: 350, y: 420 },
          { x: 450, y: 370 },
          { x: 550, y: 320 },
          { x: 650, y: 270 },
          { x: 800, y: 420 },
          { x: 950, y: 320 },
          { x: 1100, y: 420 }
        ]

        const newCollected = new Set(prevCollected)
        
        coins.forEach((coin, index) => {
          if (!prevCollected.has(index) &&
              player.x + player.width > coin.x &&
              player.x < coin.x + 16 &&
              player.y + player.height > coin.y &&
              player.y < coin.y + 16) {
            newCollected.add(index)
            setScore(prev => prev + 100)
          }
        })

        return newCollected
      })

      // Check question block collisions from below
      const questionBlocks = [
        { x: 300, y: 400, title: 'Portfolio Game', description: 'Interactive Mario-inspired portfolio showcasing skills and projects through gameplay.' },
        { x: 500, y: 350, title: 'React Components', description: 'Modular UI components built with React and TypeScript for scalable applications.' },
        { x: 700, y: 250, title: 'Next.js Projects', description: 'Full-stack web applications using Next.js with modern development practices.' },
        { x: 1000, y: 300, title: 'Game Development', description: 'Canvas-based games with physics engines and interactive user experiences.' }
      ]

      questionBlocks.forEach((block, index) => {
        if (!hitBlocks.has(index) &&
            // Player hitting block from below
            player.x + player.width > block.x &&
            player.x < block.x + 32 &&
            player.y < block.y + 32 &&
            player.y + player.height > block.y &&
            player.velY < 0) { // Player is moving upward
          
          // Add block to hit list
          setHitBlocks(prev => new Set([...prev, index]))
          setScore(prev => prev + 200)
          setBubbleText({ title: block.title, description: block.description })
          setDisplayedText({ title: '', description: '' })
          setTextAnimationIndex(0)
          setTextFullyDisplayed(false)
          setShowTextBubble(true)
          
          // Start block animation
          setBlockAnimations(prev => [...prev, {
            id: index,
            y: block.y,
            originalY: block.y,
            animTime: 0
          }])
          
          // Spawn coin animation
          setCoinAnimations(prev => [...prev, {
            x: block.x + 8,
            y: block.y - 16,
            velY: -8,
            lifetime: 60
          }])
        }
      })

      // Update block animations
      setBlockAnimations(prev => prev.map(anim => {
        anim.animTime += 16
        if (anim.animTime < 100) {
          // Pop up phase
          anim.y = anim.originalY - 8 * (1 - anim.animTime / 100)
        } else if (anim.animTime < 300) {
          // Return phase
          const t = (anim.animTime - 100) / 200
          anim.y = anim.originalY - 8 * (1 - t)
        } else {
          // Animation complete
          anim.y = anim.originalY
        }
        return anim
      }).filter(anim => anim.animTime < 300))

      // Update coin animations
      setCoinAnimations(prev => prev.map(coin => {
        coin.velY += 0.5 // Gravity for coin
        coin.y += coin.velY
        coin.lifetime -= 1
        return coin
      }).filter(coin => coin.lifetime > 0))

      // Update camera to follow player with lag (lerp)
      setCamera(prevCamera => {
        const newCamera = { ...prevCamera }
        const targetX = player.x - WORLD.SCREEN_WIDTH / 2
        const clampedTargetX = Math.max(0, Math.min(targetX, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))
        
        // Smooth camera movement with lerp
        const diff = clampedTargetX - prevCamera.x
        newCamera.x = prevCamera.x + diff * 0.1  // 0.1 lerp factor for smooth follow
        
        // Ensure camera stays in bounds
        newCamera.x = Math.max(0, Math.min(newCamera.x, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))
        
        return newCamera
      })

      // Draw background (sky)
      const gradient = ctx.createLinearGradient(0, 0, 0, WORLD.SCREEN_HEIGHT)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#98FB98')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, WORLD.SCREEN_WIDTH, WORLD.SCREEN_HEIGHT)

      // Draw clouds
      ctx.fillStyle = 'white'
      for (let i = 0; i < 10; i++) {
        const cloudX = (i * 200 + 100) - camera.x
        if (cloudX > -100 && cloudX < WORLD.SCREEN_WIDTH + 100) {
          drawCloud(ctx, cloudX, 80 + (i % 3) * 40)
        }
      }

      // Draw bushes
      const bushes = [
        { x: 200, y: WORLD.GROUND_HEIGHT - 30 },
        { x: 800, y: WORLD.GROUND_HEIGHT - 30 },
        { x: 1500, y: WORLD.GROUND_HEIGHT - 30 }
      ]
      
      bushes.forEach(bush => {
        const bushX = bush.x - camera.x
        if (bushX > -60 && bushX < WORLD.SCREEN_WIDTH) {
          drawBush(ctx, bushX, bush.y - camera.y)
        }
      })

      // Draw pipes (clickable for GitHub/LinkedIn)
      const pipes = [
        { x: 1200, y: WORLD.GROUND_HEIGHT - 64, link: 'github' },
        { x: 2000, y: WORLD.GROUND_HEIGHT - 64, link: 'linkedin' }
      ]
      
      pipes.forEach(pipe => {
        const pipeX = pipe.x - camera.x
        if (pipeX > -40 && pipeX < WORLD.SCREEN_WIDTH) {
          drawPipe(ctx, pipeX, pipe.y - camera.y)
        }
      })

      // Draw ground with brick pattern
      const groundY = WORLD.GROUND_HEIGHT - camera.y
      const groundHeight = WORLD.SCREEN_HEIGHT - groundY
      
      // Base ground color
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(0, groundY, WORLD.SCREEN_WIDTH, groundHeight)
      
      // Draw brick pattern
      ctx.fillStyle = '#A0522D'
      const brickWidth = 32
      const brickHeight = 16
      for (let x = 0; x < WORLD.SCREEN_WIDTH + brickWidth; x += brickWidth) {
        for (let y = groundY + 10; y < WORLD.SCREEN_HEIGHT; y += brickHeight) {
          // Offset every other row
          const offsetX = (Math.floor((y - groundY) / brickHeight) % 2) * (brickWidth / 2)
          const brickX = x + offsetX
          if (brickX < WORLD.SCREEN_WIDTH) {
            ctx.fillRect(brickX, y, brickWidth - 2, brickHeight - 2)
          }
        }
      }
      
      // Draw grass on top of ground
      ctx.fillStyle = '#32CD32'
      ctx.fillRect(0, groundY, WORLD.SCREEN_WIDTH, 10)

      // Draw platforms
      drawPlatforms(ctx, camera)

      // Draw player
      drawPlayer(ctx, player, camera)

      // Draw UI
      drawUI(ctx, score)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [player, camera, score, collectedCoins, hitBlocks, blockAnimations, coinAnimations, showTextBubble])

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
    const platforms = [
      { x: 400, y: 350, width: 128, height: 32 },
      { x: 600, y: 300, width: 96, height: 32 },
      { x: 900, y: 280, width: 160, height: 32 },
    ]

    // Draw brick platforms
    ctx.fillStyle = '#8B4513'
    platforms.forEach(platform => {
      const screenX = platform.x - camera.x
      const screenY = platform.y - camera.y
      if (screenX > -platform.width && screenX < WORLD.SCREEN_WIDTH) {
        // Draw as brick blocks
        const blocksWide = platform.width / 32
        for (let i = 0; i < blocksWide; i++) {
          drawBlock(ctx, screenX + i * 32, screenY, 'brick')
        }
      }
    })

    // Draw question blocks
    const questionBlocks = [
      { x: 300, y: 400 },
      { x: 500, y: 350 },
      { x: 700, y: 250 },
      { x: 1000, y: 300 }
    ]

    questionBlocks.forEach((block, index) => {
      // Check if block is animating
      const animation = blockAnimations.find(a => a.id === index)
      const animatedY = animation ? animation.y : block.y
      
      const screenX = block.x - camera.x
      const screenY = animatedY - camera.y
      if (screenX > -32 && screenX < WORLD.SCREEN_WIDTH) {
        // Draw used blocks as gray, unused as yellow
        if (hitBlocks.has(index)) {
          // Used block - draw as gray/empty block
          ctx.fillStyle = '#8B4513'
          ctx.fillRect(screenX, screenY, 32, 32)
          ctx.fillStyle = '#654321'
          ctx.fillRect(screenX + 2, screenY + 2, 28, 28)
          // Draw empty/used indicator
          ctx.strokeStyle = '#4A2C17'
          ctx.lineWidth = 2
          ctx.strokeRect(screenX + 4, screenY + 4, 24, 24)
        } else {
          drawBlock(ctx, screenX, screenY, 'question')
        }
      }
    })

    // Draw coin animations
    coinAnimations.forEach(coin => {
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH && coin.lifetime > 0) {
        // Draw animated coin
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 8, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner circle
        ctx.fillStyle = '#FFA500'
        ctx.beginPath()
        ctx.arc(screenX + 8, screenY + 8, 5, 0, Math.PI * 2)
        ctx.fill()
        
        // Score text (+200)
        if (coin.lifetime > 30) {
          ctx.fillStyle = 'white'
          ctx.font = 'bold 12px monospace'
          ctx.fillText('+200', screenX - 8, screenY - 4)
        }
      }
    })

    // Draw coins
    const coins = [
      { x: 250, y: 420 },
      { x: 350, y: 420 },
      { x: 450, y: 370 },
      { x: 550, y: 320 },
      { x: 650, y: 270 },
      { x: 800, y: 420 },
      { x: 950, y: 320 },
      { x: 1100, y: 420 }
    ]

    coins.forEach((coin, index) => {
      const screenX = coin.x - camera.x
      const screenY = coin.y - camera.y
      if (screenX > -16 && screenX < WORLD.SCREEN_WIDTH && !collectedCoins.has(index)) {
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

  const drawUI = (ctx: CanvasRenderingContext2D, score: number) => {
    // Draw a dark background for the HUD area to improve readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, WORLD.SCREEN_WIDTH, 60)
    
    // Set up retro font styling
    ctx.fillStyle = 'white'
    ctx.font = '14px "Press Start 2P", monospace'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    
    // Top row - Names and World
    ctx.fillText('HUZAIFA', 30, 25)
    
    // Center - World info  
    const worldText = 'WORLD 1-1'
    const worldWidth = ctx.measureText(worldText).width
    const centerX = (WORLD.SCREEN_WIDTH - worldWidth) / 2
    ctx.fillText(worldText, centerX, 25)
    
    // Right - Time
    ctx.fillText('TIME', WORLD.SCREEN_WIDTH - 100, 25)
    
    // Bottom row - Score, Coins
    const scoreText = score.toString().padStart(6, '0')
    ctx.fillText(scoreText, 30, 48)
    
    // Coin counter with × format
    const coinCount = Array.from(collectedCoins).length
    const coinText = `× ${coinCount.toString().padStart(2, '0')}`
    
    // Draw coin sprite
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(centerX - 20, 42, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFA500'
    ctx.beginPath()
    ctx.arc(centerX - 20, 42, 4, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw coin text
    ctx.fillStyle = 'white'
    ctx.fillText(coinText, centerX, 48)
    
    // Right side value
    ctx.fillText('400', WORLD.SCREEN_WIDTH - 100, 48)
    
    // Controls hint - positioned in safe area with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(10, WORLD.SCREEN_HEIGHT - 35, 280, 25)
    ctx.fillStyle = 'white'
    ctx.font = '10px "Press Start 2P", monospace'
    ctx.fillText('ARROWS: MOVE  SPACE: JUMP', 20, WORLD.SCREEN_HEIGHT - 15)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(to bottom, #87CEEB, #98FB98)',
      margin: 0,
      padding: 0
    }}>
      <canvas
        ref={canvasRef}
        width={WORLD.SCREEN_WIDTH}
        height={WORLD.SCREEN_HEIGHT}
        style={{
          border: '4px solid #000',
          imageRendering: 'pixelated',
          background: 'transparent'
        }}
      />
      
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