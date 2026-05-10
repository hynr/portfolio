# PORTFOLIO PROJECT CONTRACT
## Frozen Interface for Parallel Development

This contract defines the immutable interfaces between three parallel development lanes:
1. **Content Lane** - Standard portfolio mode
2. **Game Lane** - Mario-inspired game mode  
3. **Sprite Lane** - Shared sprite components

---

## 1. DATA SHAPE

TypeScript types shared between both modes. Import from `lib/portfolio-data.ts`.

```typescript
// lib/portfolio-data.ts

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  technologies: string[]
  category: 'AI/ML' | 'Backend' | 'Full Stack' | 'Frontend'
  githubUrl?: string
  liveUrl?: string
  demoUrl?: string
  features: string[]
  metrics?: string[]
  year: number
  impact: string  // e.g., "100K+ users", "92% accuracy"
}

export interface Skill {
  name: string
  level: number  // 0-100
  category: 'Languages' | 'Frameworks' | 'Cloud & DevOps' | 'Data & AI'
  icon: string  // emoji or icon identifier
  description: string
  experience: string  // e.g., "3+ years"
}

export interface Link {
  type: 'github' | 'linkedin' | 'email' | 'twitter' | 'website'
  url: string
  label: string
}

export interface Bio {
  name: string
  title: string
  location: string
  company: string
  mission: string
  status: string
  email: string
  summary: string
  highlights: string[]  // Key achievements
}

export const PORTFOLIO_DATA = {
  bio: {
    name: 'Huzaifa',
    title: 'Full-Stack Developer',
    location: 'Columbia, MD',
    company: 'HZSR',
    mission: 'Building systems that serve 100K+ users',
    status: 'Always learning, always building',
    email: 'huzaifa478@gmail.com',
    summary: 'Software Engineer specializing in Python, React, AWS, and AI/ML',
    highlights: [
      '100K+ users reached',
      '6+ years coding experience',
      'B.S. Computer Science, UMBC'
    ]
  },
  projects: [
    {
      id: 'therasort',
      title: 'Therasort – AI Therapy Note Parser',
      description: 'Clinical note parser powered by Generative AI',
      longDescription: 'Designed a clinical note parser powered by Generative AI...',
      technologies: ['Python', 'OpenAI API', 'MongoDB', 'Generative AI'],
      category: 'AI/ML',
      githubUrl: 'https://github.com/hynr/therasort',
      features: [
        'Generative AI-powered text analysis',
        'Classification into care categories',
        'MongoDB data storage'
      ],
      metrics: ['Clinical workflow optimization', 'Therapist productivity gains'],
      year: 2024,
      impact: 'Clinical workflow optimization'
    },
    // ... more projects
  ],
  skills: [
    {
      name: 'Python',
      level: 95,
      category: 'Languages',
      icon: '🐍',
      description: 'Primary language for backend and data processing',
      experience: '3+ years'
    },
    // ... more skills
  ],
  links: [
    { type: 'github', url: 'https://github.com/hynr', label: 'GitHub' },
    { type: 'linkedin', url: 'https://linkedin.com/in/huzaifa-naroo', label: 'LinkedIn' },
    { type: 'email', url: 'mailto:huzaifa478@gmail.com', label: 'Email' }
  ]
} as const
```

---

## 2. SPRITE API

Exact prop signatures for sprite components. Game mode imports these from `components/sprites/`.

```typescript
// components/sprites/PlayerSprite.tsx
export interface PlayerSpriteProps {
  x: number          // X position in pixels
  y: number          // Y position in pixels  
  width: number      // Sprite width
  height: number     // Sprite height
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'crouching'
  direction: 'left' | 'right'
  frame?: number     // Animation frame index
  className?: string
}

// components/sprites/BlockSprite.tsx
export interface BlockSpriteProps {
  x: number
  y: number
  width: number
  height: number
  type: 'brick' | 'question' | 'solid' | 'invisible'
  hit?: boolean      // Recently hit state
  empty?: boolean    // Question block exhausted
  className?: string
}

// components/sprites/PipeSprite.tsx
export interface PipeSpriteProps {
  x: number
  y: number
  width: number
  height: number
  variant: 'small' | 'medium' | 'large'
  direction?: 'up' | 'down' | 'left' | 'right'
  enterable?: boolean
  className?: string
}

// components/sprites/CoinSprite.tsx  
export interface CoinSpriteProps {
  x: number
  y: number
  size: number       // Width and height (square)
  spinning?: boolean
  collected?: boolean
  className?: string
}

// components/sprites/CloudSprite.tsx
export interface CloudSpriteProps {
  x: number
  y: number
  width: number
  height: number
  variant: 'small' | 'medium' | 'large'
  opacity?: number   // 0-1
  className?: string
}

// components/sprites/BushSprite.tsx
export interface BushSpriteProps {
  x: number
  y: number  
  width: number
  height: number
  variant: 'single' | 'double' | 'triple'
  className?: string
}

// components/sprites/GroundTile.tsx
export interface GroundTileProps {
  x: number
  y: number
  width: number
  height: number
  type: 'grass' | 'dirt' | 'stone'
  pattern?: 'top' | 'middle' | 'bottom'
  className?: string
}
```

---

## 3. FILE OWNERSHIP

Explicit ownership to prevent merge conflicts. **No file may be modified by multiple lanes.**

| File/Directory | Owner | Notes |
|----------------|-------|-------|
| `app/page.tsx` | Content Lane | Main app entry, mounts both modes |
| `app/game-mode/` | Game Lane | All game mode files |
| `app/content-mode/` | Content Lane | All content mode files |
| `components/sprites/` | Sprite Lane | Shared sprite components |
| `lib/portfolio-data.ts` | Content Lane | Portfolio data definitions |
| `lib/game-engine/` | Game Lane | Physics, collision, game logic |
| `lib/mode-toggle.ts` | Content Lane | Mode switching logic |
| `styles/sprites.css` | Sprite Lane | Sprite-specific styles |
| `styles/game.css` | Game Lane | Game-specific styles |
| `styles/content.css` | Content Lane | Content-specific styles |
| `public/sprites/` | Sprite Lane | Sprite assets (if using images) |
| `public/sounds/` | Game Lane | Game audio files |

---

## 4. MODE TOGGLE INTEGRATION

Content lane implements the mode toggle. Game lane provides a single mount component.

```typescript
// app/page.tsx (Content Lane owns this)
'use client'

import { useState, useEffect } from 'react'
import ContentMode from './content-mode/ContentMode'
import GameMode from './game-mode/GameMode'
import { getModePreference, setModePreference } from '@/lib/mode-toggle'

export default function Page() {
  const [mode, setMode] = useState<'content' | 'game'>('content')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Load saved preference
    setMode(getModePreference())
    
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches && mode === 'game') {
        setMode('content')
        setModePreference('content')
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleMode = () => {
    if (prefersReducedMotion && mode === 'content') {
      // Don't allow game mode with reduced motion
      alert('Game mode disabled: prefers-reduced-motion is enabled')
      return
    }
    
    const newMode = mode === 'content' ? 'game' : 'content'
    setMode(newMode)
    setModePreference(newMode)
  }

  return (
    <div className="min-h-screen">
      {/* Mode toggle button - always visible */}
      <button
        onClick={toggleMode}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-primary-500 text-white rounded-lg"
        aria-label={`Switch to ${mode === 'content' ? 'game' : 'content'} mode`}
      >
        {mode === 'content' ? '🎮 Game Mode' : '📄 Content Mode'}
      </button>

      {/* Render active mode */}
      {mode === 'content' ? <ContentMode /> : <GameMode />}
    </div>
  )
}

// lib/mode-toggle.ts (Content Lane owns this)
export function getModePreference(): 'content' | 'game' {
  if (typeof window === 'undefined') return 'content'
  return (localStorage.getItem('portfolio-mode') as 'content' | 'game') || 'content'
}

export function setModePreference(mode: 'content' | 'game') {
  localStorage.setItem('portfolio-mode', mode)
}

// app/game-mode/GameMode.tsx (Game Lane provides this)
export default function GameMode() {
  // Single component that mounts the entire game
  return <MarioGame />
}
```

---

## 5. PHYSICS CONSTANTS

Game physics values. Game lane tunes these but they're documented here for review.

```typescript
// lib/game-engine/physics.ts

export const PHYSICS = {
  GRAVITY: 0.5,          // Pixels per frame squared
  JUMP_VELOCITY: -12,    // Initial jump velocity (negative = up)
  MOVE_SPEED: 4,         // Horizontal movement speed
  RUN_SPEED: 6,          // Speed when running (holding shift)
  MAX_FALL_SPEED: 10,    // Terminal velocity
  FRICTION: 0.8,         // Ground friction coefficient
  AIR_RESISTANCE: 0.95,  // Air friction coefficient
  BOUNCE_VELOCITY: -8,   // Velocity when bouncing off enemy
} as const

export const WORLD = {
  TILE_SIZE: 32,         // Base tile size in pixels
  SCREEN_WIDTH: 1024,    // Viewport width
  SCREEN_HEIGHT: 576,    // Viewport height
  WORLD_WIDTH: 6400,     // Total level width
  GROUND_HEIGHT: 480,    // Ground Y position
} as const

export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 48,
  CROUCH_HEIGHT: 32,
  INVINCIBLE_TIME: 2000, // ms after taking damage
  ANIMATION_SPEED: 100,  // ms per frame
} as const

export const COLLISION = {
  PLATFORM_THRESHOLD: 8, // Pixels of overlap to count as "on platform"
  PICKUP_RADIUS: 16,     // Distance to collect items
  ENEMY_DAMAGE_BOX: 0.8, // Multiplier for enemy hitbox
} as const
```

---

## IMPLEMENTATION NOTES

1. **Parallel Development Rules:**
   - Each lane works only on files they own
   - Import shared interfaces, don't modify them
   - Sprites are read-only for Game/Content lanes
   - Use TypeScript strict mode

2. **Git Branch Strategy:**
   - Main branch has this CONTRACT.md
   - `feature/content-mode` - Content lane work
   - `feature/game-mode` - Game lane work  
   - `feature/sprites` - Sprite lane work
   - Merge to main only when all lanes ready

3. **Testing Approach:**
   - Each lane tests independently
   - Integration test when merging
   - Mode toggle must work in all states
   - Sprites must render in both modes

4. **Performance Targets:**
   - Game mode: 60 FPS minimum
   - Content mode: <100ms interaction delay
   - Mode switch: <500ms transition
   - Bundle size: <500KB per mode (code split)

---

## CONTRACT AGREEMENT

This contract is frozen. Any changes require consensus from all three development lanes.

Last Updated: 2024-01-08
Version: 1.0.0