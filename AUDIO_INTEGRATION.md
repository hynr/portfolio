# Audio & Navigation Integration Guide

This guide shows how to integrate the audio system and navigation components into your game.

## Audio System Usage

### Playing Sounds

Import and use the `playSound` function anywhere in your code:

```typescript
import { playSound } from '@/lib/audio'

// In your game loop or event handlers:
playSound('jump')      // When player jumps
playSound('land')      // When player lands
playSound('coin')      // When collecting coins
playSound('block-hit') // When hitting blocks
```

### Adding Mute Toggle

Add the AudioManager component to your game layout:

```tsx
import AudioManager from '@/components/audio/AudioManager'

export default function GameMode() {
  return (
    <>
      <AudioManager />
      {/* Your game components */}
    </>
  )
}
```

## Pipe Navigation Usage

### Using Interactive Pipes

Replace regular PipeSprite with InteractivePipeSprite:

```tsx
import InteractivePipeSprite from '@/components/game/InteractivePipeSprite'

// In your level renderer:
<InteractivePipeSprite
  x={100}
  y={300}
  width={64}
  height={128}
  variant="large"
  linkTo="github"  // Makes it clickable!
/>
```

### Available Link Types

- `github` - Opens GitHub profile
- `linkedin` - Opens LinkedIn profile  
- `email` - Opens email client
- `resume` - Opens resume PDF

## Complete Integration Example

```tsx
// app/game-mode/GameMode.tsx
'use client'

import SimpleMarioGame from './SimpleMarioGame'
import AudioManager from '@/components/audio/AudioManager'

export default function GameMode() {
  return (
    <>
      <AudioManager />
      <SimpleMarioGame />
    </>
  )
}
```

## Sound Events Reference

| Event | When to Play |
|-------|--------------|
| `jump` | Player jumps |
| `land` | Player lands on ground |
| `coin` | Coin collected |
| `block-hit` | Block hit from below |
| `block-reveal` | Item appears from block |
| `footstep` | Player walking (low volume) |
| `pipe-enter` | Entering/clicking pipe |
| `enemy-stomp` | Defeating enemy |
| `damage` | Player takes damage |
| `die` | Game over |
| `level-complete` | Reaching goal |
| `pause` | Game paused |

## Features Implemented

✅ Web Audio API with preloading
✅ Autoplay policy handling  
✅ Volume controls (30% default, 10% footsteps)
✅ Mute toggle with localStorage persistence
✅ Respects prefers-reduced-motion
✅ Pipe hover states (scale 1.05)
✅ Keyboard accessible pipes
✅ Aria labels for accessibility

## Notes

- Sounds are placeholder tones for now
- Replace with proper 8-bit sounds from CC0 sources
- See `public/sounds/CREDITS.md` for sound source recommendations