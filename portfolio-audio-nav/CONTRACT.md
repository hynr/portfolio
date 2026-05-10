# Portfolio Game Development Contract

This contract defines the interfaces and boundaries between three parallel development lanes:
1. **Level Design Lane** (`feat/level-design`) - Level layouts, enemy placement, collectibles
2. **Animations & Physics Lane** (`feat/animations-physics`) - Player movement, enemy AI, game feel
3. **Audio & Navigation Lane** (`feat/audio-and-pipes`) - Sound effects, music, pipe links

## 1. LEVEL DATA SHAPE

All level data is defined in `lib/level-data.ts`. Only the Level Design Lane writes this file.

```typescript
// lib/level-data.ts

export interface Position {
  x: number
  y: number
}

export interface Block extends Position {
  type: 'brick' | 'question' | 'hidden'
  contains?: 'coin' | 'powerup' | 'star' | 'project'
  projectId?: string  // Links to project data
}

export interface Coin extends Position {
  collected?: boolean
}

export interface Pipe extends Position {
  height: 1 | 2 | 3  // 1 = short, 2 = medium, 3 = tall
  linkTo?: 'github' | 'linkedin' | 'email' | 'resume'
  enterable?: boolean
}

export interface Platform extends Position {
  width: number
  height: number
  type: 'grass' | 'brick' | 'cloud'
}

export interface Enemy extends Position {
  type: 'goomba' | 'koopa' | 'flying-koopa'
  patrolStart: number
  patrolEnd: number
  speed: number
}

export interface Decoration extends Position {
  type: 'bush' | 'cloud' | 'hill' | 'castle'
  layer: 'background' | 'midground' | 'foreground'
}

export interface ProjectData {
  id: string
  title: string
  description: string
  technologies: string[]
  link?: string
}

export interface LevelData {
  width: number  // Total level width in pixels
  height: number  // Total level height in pixels
  startPosition: Position
  goalPosition: Position
  groundHeight: number
  groundVariation?: Array<{
    start: number
    end: number
    height: number
  }>
  blocks: Block[]
  coins: Coin[]
  pipes: Pipe[]
  platforms: Platform[]
  enemies: Enemy[]
  decorations: Decoration[]
  projects: ProjectData[]
  theme: 'overworld' | 'underground' | 'castle'
}

// Export the actual level instance
export const level_1_1: LevelData = {
  width: 6400,
  height: 576,
  startPosition: { x: 100, y: 400 },
  goalPosition: { x: 6200, y: 400 },
  groundHeight: 450,
  blocks: [],  // Level Design Lane populates
  coins: [],   // Level Design Lane populates  
  pipes: [],   // Level Design Lane populates
  platforms: [], // Level Design Lane populates
  enemies: [],  // Level Design Lane populates
  decorations: [], // Level Design Lane populates
  projects: [], // Level Design Lane populates
  theme: 'overworld'
}
```

## 2. ANIMATION STATES

Animation states are defined as an enum. The game loop sets these states; sprite components read them.

```typescript
// lib/animation-states.ts

export enum PlayerState {
  IDLE = 'idle',
  WALKING = 'walking',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling',
  LANDING = 'landing',
  CROUCHING = 'crouching',
  DYING = 'dying',
  VICTORY = 'victory'
}

export enum EnemyState {
  IDLE = 'idle',
  PATROLLING = 'patrolling',
  STUNNED = 'stunned',
  DEFEATED = 'defeated'
}

// Props for player sprite component
export interface PlayerSpriteProps {
  x: number
  y: number
  state: PlayerState
  facing: 'left' | 'right'
  animationFrame: number
  scaleY?: number  // For squash/stretch
}

// Props for enemy sprite component  
export interface EnemySpriteProps {
  x: number
  y: number
  type: 'goomba' | 'koopa' | 'flying-koopa'
  state: EnemyState
  facing: 'left' | 'right'
  animationFrame: number
}
```

## 3. SOUND EVENT API

All sound events go through a single API in `lib/audio.ts`. Only the Audio Lane implements this.

```typescript
// lib/audio.ts

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

// Main API - other lanes call this
export function playSound(event: SoundEvent): void {
  // Audio Lane implements this
  // For now, just console.log to prevent errors
  console.log('[Sound]', event)
}

// Mute control
let muted = false

export function setMuted(isMuted: boolean): void {
  muted = isMuted
}

export function getMuted(): boolean {
  return muted
}

// Background music control
export function playMusic(track: 'main' | 'underground' | 'castle' | 'victory'): void {
  // Audio Lane implements this
  console.log('[Music]', track)
}

export function stopMusic(): void {
  // Audio Lane implements this
  console.log('[Music] stopped')
}
```

## 4. PIPE LINK MAP

Pipes can link to external sites. Navigation wiring happens in the Audio & Navigation Lane.

```typescript
// components/sprites/PipeSprite.tsx (owned by Level Design Lane)
export interface PipeSpriteProps {
  x: number
  y: number
  height: 1 | 2 | 3
  linkTo?: 'github' | 'linkedin' | 'email' | 'resume'
  onClick?: () => void  // Audio & Nav Lane provides this
  enterable?: boolean
}

// lib/navigation.ts (owned by Audio & Navigation Lane)
export function handlePipeClick(linkTo: string): void {
  switch(linkTo) {
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
```

## 5. FILE OWNERSHIP TABLE

Explicit ownership to prevent merge conflicts. **No file may be modified by multiple lanes.**

| File/Directory | Owner | Notes |
|---|---|---|
| **Level Design Lane** |
| `lib/level-data.ts` | Level Design | Level layouts, collectibles |
| `components/sprites/BlockSprite.tsx` | Level Design | Block rendering |
| `components/sprites/CoinSprite.tsx` | Level Design | Coin rendering |
| `components/sprites/PipeSprite.tsx` | Level Design | Pipe rendering |
| `components/sprites/PlatformSprite.tsx` | Level Design | Platform rendering |
| `components/sprites/DecorationSprite.tsx` | Level Design | Background elements |
| `components/game/LevelRenderer.tsx` | Level Design | Renders level elements |
| **Animations & Physics Lane** |
| `lib/physics.ts` | Animations & Physics | Physics constants |
| `lib/animation-states.ts` | Animations & Physics | Animation state enums |
| `components/sprites/PlayerSprite.tsx` | Animations & Physics | Player rendering |
| `components/sprites/EnemySprite.tsx` | Animations & Physics | Enemy rendering |
| `components/game/GameEngine.tsx` | Animations & Physics | Main game loop |
| `components/game/Camera.tsx` | Animations & Physics | Camera system |
| **Audio & Navigation Lane** |
| `lib/audio.ts` | Audio & Navigation | Sound implementation |
| `lib/navigation.ts` | Audio & Navigation | Link handling |
| `components/game/HUD.tsx` | Audio & Navigation | Score, timer, coins |
| `components/game/PauseMenu.tsx` | Audio & Navigation | Pause screen |
| `components/audio/AudioManager.tsx` | Audio & Navigation | Sound system |
| `components/audio/MusicPlayer.tsx` | Audio & Navigation | Background music |
| **Shared/Integration** |
| `app/page.tsx` | MERGE POINT | All lanes add imports |
| `app/game-mode/GameMode.tsx` | MERGE POINT | All lanes add components |
| `components/game/Scene.tsx` | MERGE POINT | Visual composition |

## 6. INTEGRATION POINTS

### app/game-mode/GameMode.tsx Structure
```typescript
// Top: imports from all lanes
import { GameEngine } from '@/components/game/GameEngine'  // Physics
import { LevelRenderer } from '@/components/game/LevelRenderer'  // Level
import { HUD } from '@/components/game/HUD'  // Audio
import { AudioManager } from '@/components/audio/AudioManager'  // Audio
import { level_1_1 } from '@/lib/level-data'  // Level

export default function GameMode() {
  // State from each lane
  const [paused, setPaused] = useState(false)  // Audio
  const [muted, setMuted] = useState(false)  // Audio
  const [camera, setCamera] = useState({x: 0, y: 0})  // Physics
  const [playerState, setPlayerState] = useState()  // Physics
  
  return (
    <div className="game-container">
      {/* Audio Lane components */}
      <AudioManager muted={muted} />
      
      {/* Main game canvas with all lanes */}
      <canvas id="game-canvas">
        {/* Physics Lane runs the engine */}
        <GameEngine 
          level={level_1_1}
          paused={paused}
          onCameraUpdate={setCamera}
          onStateChange={setPlayerState}
        />
        
        {/* Level Lane renders the world */}
        <LevelRenderer 
          level={level_1_1}
          camera={camera}
        />
      </canvas>
      
      {/* Audio Lane HUD */}
      <HUD 
        onPause={() => setPaused(!paused)}
        onMute={() => setMuted(!muted)}
      />
    </div>
  )
}
```

### components/game/Scene.tsx Structure
```typescript
// Scene.tsx is the visual composition point
export function Scene({ level, camera, playerPos, enemyPositions }) {
  return (
    <>
      {/* Level Lane renders static elements */}
      <Decorations items={level.decorations} camera={camera} />
      <Platforms items={level.platforms} camera={camera} />
      <Pipes items={level.pipes} camera={camera} />
      <Blocks items={level.blocks} camera={camera} />
      <Coins items={level.coins} camera={camera} />
      
      {/* Physics Lane renders dynamic elements */}
      <Enemies items={enemyPositions} camera={camera} />
      <Player position={playerPos} camera={camera} />
    </>
  )
}
```

## MERGE STRATEGY

1. Each lane works in their worktree
2. Lanes only modify files they own
3. Integration files use clear section comments
4. Merge order:
   - Level Design → main (static elements)
   - Animations & Physics → main (dynamic elements)
   - Audio & Navigation → main (sound & UI)
5. Conflicts should be minimal due to file ownership

## PHYSICS CONSTANTS

Game physics values shared between lanes:

```typescript
// lib/physics.ts (owned by Animations & Physics Lane)

export const PHYSICS = {
  GRAVITY: 1.0,
  GRAVITY_REDUCED: 0.5,  // Variable jump
  JUMP_VELOCITY: -18,
  MOVE_SPEED: 6,
  MAX_FALL_SPEED: 15,
  FRICTION: 0.88,
  ACCELERATION: 0.8,
  COYOTE_TIME: 80,  // ms
  MAX_JUMP_HOLD: 250  // ms
}

export const WORLD = {
  TILE_SIZE: 32,
  SCREEN_WIDTH: 1024,
  SCREEN_HEIGHT: 576,
  GROUND_HEIGHT: 450
}
```

## COMMUNICATION PROTOCOL

- New level elements: Update `LevelData` interface
- New animation states: Update `PlayerState` enum  
- New sound events: Update `SoundEvent` type
- New pipe destinations: Update `linkTo` type

This contract is frozen once development begins. Changes require all lanes to agree.

---
**Version**: 1.0.0  
**Date**: 2024-01-08