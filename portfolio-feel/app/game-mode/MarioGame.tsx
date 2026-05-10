'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GameLoop } from '@/lib/game-engine/game-loop'
import { InputHandler } from '@/lib/game-engine/input'
import { PhysicsEngine, PhysicsBody, PHYSICS, WORLD, PLAYER } from '@/lib/game-engine/physics'
import { CollisionSystem, Platform, Collectible, Interactive } from '@/lib/game-engine/collision'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'
import { playSound } from '@/lib/audio'

// Sprite imports
import PlayerSprite from '@/components/sprites/PlayerSprite'
import BlockSprite from '@/components/sprites/BlockSprite'
import CoinSprite from '@/components/sprites/CoinSprite'
import GroundTile from '@/components/sprites/GroundTile'
import CloudSprite from '@/components/sprites/CloudSprite'
import BushSprite from '@/components/sprites/BushSprite'
import TouchControls from './TouchControls'

interface PlayerState extends PhysicsBody {
  state: 'idle' | 'walking' | 'jumping' | 'falling' | 'landing' | 'crouching'
  direction: 'left' | 'right'
  frame: number
  animationTimer: number
  landingTimer: number
  scaleY: number
  lastGroundTime: number
  jumpHoldTime: number
  jumpBufferTime: number
  wasOnGround: boolean
  footstepTimer: number
  targetVelocityX: number
}

interface GameData {
  player: PlayerState
  platforms: Platform[]
  collectibles: Collectible[]
  interactives: Interactive[]
  camera: { x: number; y: number }
  score: number
  collectedSkills: string[]
  discoveredProjects: string[]
}

export default function MarioGame() {
  const gameLoopRef = useRef<GameLoop | null>(null)
  const inputHandlerRef = useRef<InputHandler | null>(null)
  const [gameState, setGameState] = useState<GameData>(() => {
    // Initialize game state
    const player: PlayerState = {
      position: { x: 100, y: WORLD.GROUND_HEIGHT - PLAYER.HEIGHT },
      velocity: { x: 0, y: 0 },
      width: PLAYER.WIDTH,
      height: PLAYER.HEIGHT,
      onGround: true,
      state: 'idle',
      direction: 'right',
      frame: 0,
      animationTimer: 0,
      landingTimer: 0,
      scaleY: 1.0,
      lastGroundTime: Date.now(),
      jumpHoldTime: 0,
      jumpBufferTime: 0,
      wasOnGround: true,
      footstepTimer: 0,
      targetVelocityX: 0
    }

    // Create ground platforms
    const platforms: Platform[] = []
    for (let x = 0; x < WORLD.WORLD_WIDTH; x += WORLD.TILE_SIZE) {
      platforms.push({
        x,
        y: WORLD.GROUND_HEIGHT,
        width: WORLD.TILE_SIZE,
        height: WORLD.TILE_SIZE * 2,
        solid: true
      })
    }

    // Add Mario-style floating platforms and stairs
    platforms.push(
      // Starting area platforms
      { x: 400, y: 400, width: 64, height: 32, solid: true },
      { x: 500, y: 350, width: 64, height: 32, solid: true },
      { x: 600, y: 300, width: 64, height: 32, solid: true },
      
      // Mid-level platforms
      { x: 900, y: 380, width: 128, height: 32, solid: true },
      { x: 1200, y: 320, width: 96, height: 32, solid: true },
      { x: 1400, y: 280, width: 160, height: 32, solid: true },
      
      // Stair patterns
      { x: 1700, y: 420, width: 32, height: 32, solid: true },
      { x: 1732, y: 388, width: 32, height: 64, solid: true },
      { x: 1764, y: 356, width: 32, height: 96, solid: true },
      { x: 1796, y: 324, width: 32, height: 128, solid: true },
      
      // End area platforms
      { x: 2000, y: 350, width: 128, height: 32, solid: true },
      { x: 2200, y: 280, width: 96, height: 32, solid: true },
      { x: 2400, y: 320, width: 160, height: 32, solid: true }
    )

    // Create collectibles from skills - scattered throughout level
    const collectibles: Collectible[] = [
      // Ground level coins
      { x: 250, y: WORLD.GROUND_HEIGHT - 50, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[0] },
      { x: 320, y: WORLD.GROUND_HEIGHT - 50, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[1] },
      
      // Platform coins
      { x: 430, y: 370, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[2] },
      { x: 530, y: 320, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[3] },
      { x: 630, y: 270, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[4] },
      
      // Floating coins
      { x: 800, y: 350, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[5] },
      { x: 1000, y: 300, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[6] },
      { x: 1300, y: 250, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[7] },
      
      // End area coins
      { x: 2030, y: 320, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[8] },
      { x: 2230, y: 250, width: 24, height: 24, collected: false, type: 'coin', data: PORTFOLIO_DATA.skills[9] || PORTFOLIO_DATA.skills[0] }
    ]

    // Create interactive blocks from projects - strategically placed
    const interactives: Interactive[] = [
      // Question blocks with projects
      { x: 470, y: 350, width: 32, height: 32, hit: false, type: 'question', data: PORTFOLIO_DATA.projects[0] },
      { x: 950, y: 330, width: 32, height: 32, hit: false, type: 'question', data: PORTFOLIO_DATA.projects[1] },
      { x: 1450, y: 230, width: 32, height: 32, hit: false, type: 'question', data: PORTFOLIO_DATA.projects[2] },
      { x: 2050, y: 300, width: 32, height: 32, hit: false, type: 'question', data: PORTFOLIO_DATA.projects[3] || PORTFOLIO_DATA.projects[0] },
      
      // Brick blocks for decoration
      { x: 502, y: 350, width: 32, height: 32, hit: false, type: 'brick', data: null },
      { x: 534, y: 350, width: 32, height: 32, hit: false, type: 'brick', data: null },
      { x: 982, y: 330, width: 32, height: 32, hit: false, type: 'brick', data: null },
      { x: 1482, y: 230, width: 32, height: 32, hit: false, type: 'brick', data: null }
    ]

    return {
      player,
      platforms,
      collectibles,
      interactives,
      camera: { x: 0, y: 0 },
      score: 0,
      collectedSkills: [],
      discoveredProjects: []
    }
  })

  const updateGame = useCallback((deltaTime: number) => {
    if (!inputHandlerRef.current) return

    const input = inputHandlerRef.current.getInputState()
    
    setGameState(prevState => {
      const newState = { ...prevState }
      const player = { ...newState.player }
      const currentTime = Date.now()

      // Track previous ground state for landing detection
      const wasInAir = !player.wasOnGround
      player.wasOnGround = player.onGround

      // Handle horizontal movement with acceleration
      let moveSpeed = input.run ? PHYSICS.RUN_SPEED : PHYSICS.MOVE_SPEED
      
      if (input.left) {
        player.targetVelocityX = -moveSpeed
        player.direction = 'left'
      } else if (input.right) {
        player.targetVelocityX = moveSpeed
        player.direction = 'right'
      } else {
        player.targetVelocityX = 0
      }

      // Apply acceleration/deceleration
      const accelRate = PHYSICS.ACCELERATION
      if (Math.abs(player.targetVelocityX) > 0.1) {
        player.velocity.x += (player.targetVelocityX - player.velocity.x) * accelRate
      } else {
        player.velocity.x *= PHYSICS.FRICTION
      }

      // Handle crouching
      if (input.down && player.onGround) {
        player.state = 'crouching'
        player.height = PLAYER.CROUCH_HEIGHT
      } else {
        player.height = PLAYER.HEIGHT
      }

      // Jump buffer - store jump input even before landing
      if (input.jump) {
        player.jumpBufferTime = currentTime
      }

      // Coyote time - track when we left ground
      if (player.onGround) {
        player.lastGroundTime = currentTime
      }

      // Handle jumping with coyote time and jump buffer
      const canCoyoteJump = currentTime - player.lastGroundTime < PHYSICS.COYOTE_TIME
      const hasJumpBuffer = currentTime - player.jumpBufferTime < PHYSICS.JUMP_BUFFER
      
      if (hasJumpBuffer && (player.onGround || canCoyoteJump)) {
        player.velocity.y = PHYSICS.JUMP_VELOCITY
        player.onGround = false
        player.jumpHoldTime = currentTime
        player.jumpBufferTime = 0 // Clear buffer after using
        playSound('jump')
      }

      // Variable jump height - reduced gravity while holding jump
      if (!player.onGround) {
        const isHoldingJump = input.jump && 
          currentTime - player.jumpHoldTime < PHYSICS.MAX_JUMP_HOLD &&
          player.velocity.y < 0
        
        const gravity = isHoldingJump ? PHYSICS.GRAVITY_REDUCED : PHYSICS.GRAVITY
        player.velocity.y += gravity
        
        if (player.velocity.y > PHYSICS.MAX_FALL_SPEED) {
          player.velocity.y = PHYSICS.MAX_FALL_SPEED
        }
      }

      // Apply friction
      PhysicsEngine.applyFriction(player)
      PhysicsEngine.updatePosition(player)

      // Handle world bounds
      if (player.position.x < 0) {
        player.position.x = 0
        player.velocity.x = 0
      }
      if (player.position.x > WORLD.WORLD_WIDTH - player.width) {
        player.position.x = WORLD.WORLD_WIDTH - player.width
        player.velocity.x = 0
      }

      // Ground collision
      PhysicsEngine.checkGroundCollision(player, WORLD.GROUND_HEIGHT)

      // Platform collisions
      CollisionSystem.checkPlatformCollisions(player, newState.platforms)

      // Landing detection and squash animation
      if (player.onGround && wasInAir && player.velocity.y >= 0) {
        player.landingTimer = currentTime
        player.scaleY = PHYSICS.LANDING_SCALE_Y
        playSound('land')
      }

      // Update landing squash animation
      if (currentTime - player.landingTimer < PHYSICS.LANDING_SQUASH_TIME) {
        player.state = 'landing'
        const progress = (currentTime - player.landingTimer) / PHYSICS.LANDING_SQUASH_TIME
        player.scaleY = PHYSICS.LANDING_SCALE_Y + (1 - PHYSICS.LANDING_SCALE_Y) * progress
      } else {
        player.scaleY = 1.0
      }

      // Update animation state
      if (player.state !== 'landing') {
        if (input.down && player.onGround) {
          player.state = 'crouching'
        } else if (!player.onGround) {
          player.state = player.velocity.y < 0 ? 'jumping' : 'falling'
        } else if (Math.abs(player.velocity.x) > 0.5) {
          player.state = 'walking'
          
          // Footstep sound
          if (currentTime - player.footstepTimer > 200) {
            player.footstepTimer = currentTime
            playSound('footstep')
          }
        } else {
          player.state = 'idle'
        }
      }

      // Update animation frame for walking
      if (player.state === 'walking') {
        player.animationTimer += deltaTime * 16 // Convert to ms
        if (player.animationTimer >= 8 * 16) { // 8 frames at 60fps
          player.animationTimer = 0
          player.frame = (player.frame + 1) % 2
        }
      } else {
        player.frame = 0
        player.animationTimer = 0
      }

      // Check collectibles
      const collected = CollisionSystem.checkCollectibles(player, newState.collectibles)
      collected.forEach(item => {
        if (item.data && !newState.collectedSkills.includes(item.data.name)) {
          newState.collectedSkills.push(item.data.name)
          newState.score += 100
          playSound('coin')
        }
      })

      // Check interactives
      const hit = CollisionSystem.checkInteractives(player, newState.interactives)
      hit.forEach(item => {
        if (item.data && !newState.discoveredProjects.includes(item.data.id)) {
          newState.discoveredProjects.push(item.data.id)
          newState.score += 500
          playSound('block-reveal')
        }
      })

      // Update camera with smooth follow
      const targetCameraX = player.position.x - WORLD.SCREEN_WIDTH / 2
      const cameraLag = 0.1
      newState.camera.x = newState.camera.x + (targetCameraX - newState.camera.x) * cameraLag
      newState.camera.x = Math.max(0, Math.min(newState.camera.x, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))

      newState.player = player
      return newState
    })
  }, [])

  const renderGame = useCallback(() => {
    // Rendering is handled by React components
  }, [])

  useEffect(() => {
    inputHandlerRef.current = new InputHandler()
    gameLoopRef.current = new GameLoop(updateGame, renderGame)
    gameLoopRef.current.start()

    return () => {
      gameLoopRef.current?.stop()
      inputHandlerRef.current?.cleanup()
    }
  }, [updateGame, renderGame])

  // Render ground tiles
  const renderGround = () => {
    const tiles = []
    const startTile = Math.floor(gameState.camera.x / WORLD.TILE_SIZE)
    const endTile = Math.ceil((gameState.camera.x + WORLD.SCREEN_WIDTH) / WORLD.TILE_SIZE)

    for (let i = startTile; i <= endTile; i++) {
      const x = i * WORLD.TILE_SIZE - gameState.camera.x
      
      // Ground tiles
      tiles.push(
        <GroundTile
          key={`ground-${i}`}
          x={x}
          y={WORLD.GROUND_HEIGHT - gameState.camera.y}
          width={WORLD.TILE_SIZE}
          height={WORLD.TILE_SIZE}
          type="grass"
          pattern="top"
        />
      )
      
      // Underground tiles
      tiles.push(
        <GroundTile
          key={`underground-${i}`}
          x={x}
          y={WORLD.GROUND_HEIGHT + WORLD.TILE_SIZE - gameState.camera.y}
          width={WORLD.TILE_SIZE}
          height={WORLD.TILE_SIZE}
          type="dirt"
          pattern="middle"
        />
      )
    }
    return tiles
  }

  // Render floating platforms
  const renderPlatforms = () => {
    return gameState.platforms
      .filter(platform => platform.y < WORLD.GROUND_HEIGHT) // Only floating platforms
      .filter(platform => 
        platform.x + platform.width >= gameState.camera.x && 
        platform.x <= gameState.camera.x + WORLD.SCREEN_WIDTH
      )
      .map((platform, index) => (
        <GroundTile
          key={`platform-${index}`}
          x={platform.x - gameState.camera.x}
          y={platform.y - gameState.camera.y}
          width={platform.width}
          height={platform.height}
          type="stone"
          pattern="top"
        />
      ))
  }

  // Render background clouds
  const renderClouds = () => {
    const clouds = []
    for (let i = 0; i < 10; i++) {
      const x = i * 200 + 100
      if (x + 80 >= gameState.camera.x && x <= gameState.camera.x + WORLD.SCREEN_WIDTH) {
        clouds.push(
          <CloudSprite
            key={`cloud-${i}`}
            x={x - gameState.camera.x}
            y={50 + (i % 3) * 30}
            width={80}
            height={50}
            variant={['small', 'medium', 'large'][i % 3] as 'small' | 'medium' | 'large'}
          />
        )
      }
    }
    return clouds
  }

  // Render bushes
  const renderBushes = () => {
    const bushes = []
    for (let i = 0; i < 8; i++) {
      const x = i * 300 + 50
      if (x + 60 >= gameState.camera.x && x <= gameState.camera.x + WORLD.SCREEN_WIDTH) {
        bushes.push(
          <BushSprite
            key={`bush-${i}`}
            x={x - gameState.camera.x}
            y={WORLD.GROUND_HEIGHT - 25 - gameState.camera.y}
            width={60}
            height={25}
            variant={['single', 'double', 'triple'][i % 3] as 'single' | 'double' | 'triple'}
          />
        )
      }
    }
    return bushes
  }

  return (
    <div className="game-container" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Game world */}
      <div style={{
        position: 'absolute',
        width: WORLD.SCREEN_WIDTH,
        height: WORLD.SCREEN_HEIGHT,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden',
        border: '2px solid #000',
        backgroundColor: '#87CEEB',
      }}>
        {/* Background clouds */}
        {renderClouds()}
        
        {/* Ground and platforms */}
        {renderGround()}
        {renderPlatforms()}
        
        {/* Bushes */}
        {renderBushes()}
        
        {/* Collectibles (coins) */}
        {gameState.collectibles
          .filter(coin => 
            coin.x + coin.width >= gameState.camera.x && 
            coin.x <= gameState.camera.x + WORLD.SCREEN_WIDTH
          )
          .map((coin, index) => (
            <CoinSprite
              key={`coin-${index}`}
              x={coin.x - gameState.camera.x}
              y={coin.y - gameState.camera.y}
              size={coin.width}
              spinning={true}
              collected={coin.collected}
            />
          ))
        }

        {/* Interactive blocks */}
        {gameState.interactives
          .filter(block => 
            block.x + block.width >= gameState.camera.x && 
            block.x <= gameState.camera.x + WORLD.SCREEN_WIDTH
          )
          .map((block, index) => (
            <BlockSprite
              key={`block-${index}`}
              x={block.x - gameState.camera.x}
              y={block.y - gameState.camera.y}
              width={block.width}
              height={block.height}
              type={block.type === 'block' ? 'brick' : block.type}
              hit={block.hit}
              empty={block.hit}
            />
          ))
        }

        {/* Player */}
        <PlayerSprite
          x={gameState.player.position.x - gameState.camera.x}
          y={gameState.player.position.y - gameState.camera.y}
          width={gameState.player.width}
          height={gameState.player.height}
          state={gameState.player.state}
          direction={gameState.player.direction}
          frame={gameState.player.frame}
          scaleY={gameState.player.scaleY}
        />
      </div>

      {/* Mario-style UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '16px',
        fontWeight: 'bold',
        textShadow: '2px 2px 0px rgba(0,0,0,1)',
        zIndex: 10,
        display: 'flex',
        gap: '40px',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#FFD700' }}>SCORE</div>
          <div style={{ letterSpacing: '2px', fontSize: '18px' }}>
            {gameState.score.toString().padStart(6, '0')}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#FFD700' }}>⭐ x {gameState.collectedSkills.length.toString().padStart(2, '0')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#FFD700' }}>PROJECTS</div>
          <div style={{ fontSize: '18px' }}>
            {gameState.discoveredProjects.length}/{PORTFOLIO_DATA.projects.length}
          </div>
        </div>
      </div>
      
      {/* Player avatar in top right */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '30px',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '20px',
        fontWeight: 'bold',
        textShadow: '2px 2px 0px rgba(0,0,0,1)',
        zIndex: 10,
        border: '3px solid #32CD32',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(50, 205, 50, 0.3)'
      }}>
        H
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: '#fff',
        fontSize: '14px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        display: typeof window !== 'undefined' && window.innerWidth > 768 ? 'block' : 'none',
      }}>
        <div>WASD/Arrows: Move</div>
        <div>Space: Jump</div>
        <div>Shift: Run</div>
      </div>

      {/* Touch Controls for mobile */}
      <TouchControls inputHandler={inputHandlerRef.current} />
    </div>
  )
}