'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GameLoop } from '@/lib/game-engine/game-loop'
import { InputHandler } from '@/lib/game-engine/input'
import { PhysicsEngine, PhysicsBody, PHYSICS, WORLD, PLAYER } from '@/lib/game-engine/physics'
import { CollisionSystem, Platform, Collectible, Interactive } from '@/lib/game-engine/collision'
import { PORTFOLIO_DATA } from '@/lib/portfolio-data'

// Sprite imports
import PlayerSprite from '@/components/sprites/PlayerSprite'
import BlockSprite from '@/components/sprites/BlockSprite'
import CoinSprite from '@/components/sprites/CoinSprite'
import GroundTile from '@/components/sprites/GroundTile'
import CloudSprite from '@/components/sprites/CloudSprite'
import BushSprite from '@/components/sprites/BushSprite'
import TouchControls from './TouchControls'

interface PlayerState extends PhysicsBody {
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'crouching'
  direction: 'left' | 'right'
  frame: number
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
      frame: 0
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

    // Add some floating platforms for projects
    platforms.push(
      { x: 300, y: 350, width: 128, height: 32, solid: true },
      { x: 500, y: 280, width: 96, height: 32, solid: true },
      { x: 800, y: 320, width: 160, height: 32, solid: true },
      { x: 1100, y: 250, width: 128, height: 32, solid: true }
    )

    // Create collectibles from skills
    const collectibles: Collectible[] = PORTFOLIO_DATA.skills.map((skill, index) => ({
      x: 200 + index * 150,
      y: WORLD.GROUND_HEIGHT - 50,
      width: 24,
      height: 24,
      collected: false,
      type: 'coin',
      data: skill
    }))

    // Create interactive blocks from projects
    const interactives: Interactive[] = PORTFOLIO_DATA.projects.map((project, index) => ({
      x: 350 + index * 300,
      y: 318, // Above first platform
      width: 32,
      height: 32,
      hit: false,
      type: 'question',
      data: project
    }))

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

      // Handle input
      let moveSpeed = input.run ? PHYSICS.RUN_SPEED : PHYSICS.MOVE_SPEED
      
      if (input.left) {
        player.velocity.x = -moveSpeed
        player.direction = 'left'
        player.state = player.onGround ? 'running' : player.state
      } else if (input.right) {
        player.velocity.x = moveSpeed
        player.direction = 'right'
        player.state = player.onGround ? 'running' : player.state
      } else {
        player.state = player.onGround ? 'idle' : player.state
      }

      if (input.down && player.onGround) {
        player.state = 'crouching'
        player.height = PLAYER.CROUCH_HEIGHT
      } else {
        player.height = PLAYER.HEIGHT
      }

      if (input.jump && player.onGround) {
        player.velocity.y = PHYSICS.JUMP_VELOCITY
        player.state = 'jumping'
        player.onGround = false
      }

      // Update physics
      PhysicsEngine.applyGravity(player)
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

      // Check collectibles
      const collected = CollisionSystem.checkCollectibles(player, newState.collectibles)
      collected.forEach(item => {
        if (item.data && !newState.collectedSkills.includes(item.data.name)) {
          newState.collectedSkills.push(item.data.name)
          newState.score += 100
        }
      })

      // Check interactives
      const hit = CollisionSystem.checkInteractives(player, newState.interactives)
      hit.forEach(item => {
        if (item.data && !newState.discoveredProjects.includes(item.data.id)) {
          newState.discoveredProjects.push(item.data.id)
          newState.score += 500
        }
      })

      // Update player state based on velocity
      if (!player.onGround) {
        player.state = player.velocity.y < 0 ? 'jumping' : 'falling'
      }

      // Update camera to follow player
      const targetCameraX = player.position.x - WORLD.SCREEN_WIDTH / 2
      newState.camera.x = Math.max(0, Math.min(targetCameraX, WORLD.WORLD_WIDTH - WORLD.SCREEN_WIDTH))

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
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#87CEEB', // Sky blue
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
              type={block.type}
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
        />
      </div>

      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        zIndex: 10,
      }}>
        <div>Score: {gameState.score}</div>
        <div>Skills: {gameState.collectedSkills.length}/{PORTFOLIO_DATA.skills.length}</div>
        <div>Projects: {gameState.discoveredProjects.length}/{PORTFOLIO_DATA.projects.length}</div>
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