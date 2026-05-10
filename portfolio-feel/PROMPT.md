# Animations & Physics Lane - PROMPT

You are working on the **Animations & Physics Lane** for a Mario-inspired portfolio game. Your responsibility is player movement, enemy AI, physics, and game feel.

## CONTRACT
Read CONTRACT.md first. You own these files:
- `lib/physics.ts` - Physics constants and calculations
- `lib/animation-states.ts` - Animation state enums
- `components/sprites/PlayerSprite.tsx` - Player rendering
- `components/sprites/EnemySprite.tsx` - Enemy rendering  
- `components/game/GameEngine.tsx` - Main game loop
- `components/game/Camera.tsx` - Camera system

## YOUR TASKS

### 1. Implement Physics System
In `lib/physics.ts`:
- Use the exact constants from CONTRACT.md
- Implement gravity, velocity, acceleration
- Handle collision detection with platforms/blocks
- Create jump mechanics with variable height
- Add momentum and friction

### 2. Create Player Movement
In `components/game/GameEngine.tsx`:
- Smooth horizontal movement with acceleration
- Variable jump height (hold for higher)
- Coyote time (jump grace after leaving platform)
- Landing squash animation
- State management (idle, walking, jumping, etc.)

### 3. Implement Enemy AI
Simple but effective enemy behaviors:
- **Goomba**: Walk back and forth, reverse at edges
- **Koopa**: Similar but survives one stomp (becomes shell)
- **Flying Koopa**: Sine wave flight pattern
- Handle enemy-player collisions
- Defeat mechanics (jump on top)

### 4. Create Sprite Components
Pixel-art player and enemy sprites:
- **PlayerSprite**: Multiple frames for each state
  - Idle (1 frame)
  - Walking (2-3 frames)
  - Jumping (1 frame)
  - Falling (1 frame)
- **EnemySprite**: Simple animations for each type
  - Walking frames
  - Defeated state

### 5. Camera System
In `components/game/Camera.tsx`:
- Follow player with smooth lerp
- Look-ahead based on movement direction
- Clamp to level boundaries
- Screen shake for impacts

## PHYSICS FEEL GUIDELINES

### Movement Should Feel:
- **Responsive**: Instant feedback to input
- **Weighty**: Not floaty, proper gravity
- **Smooth**: No janky transitions
- **Predictable**: Consistent physics

### Key Values (from CONTRACT.md):
```typescript
GRAVITY: 1.0
GRAVITY_REDUCED: 0.5  // While holding jump
JUMP_VELOCITY: -18
MOVE_SPEED: 6
MAX_FALL_SPEED: 15
FRICTION: 0.88
ACCELERATION: 0.8
COYOTE_TIME: 80ms
MAX_JUMP_HOLD: 250ms
```

### Polish Details:
- Squash on landing (scaleY: 0.9 for 80ms)
- Stretch while jumping (scaleY: 1.1)
- Dust particles on land/jump
- Smooth acceleration curves
- Frame-perfect collision detection

## INTEGRATION POINTS
- Read level data from `lib/level-data.ts` (Level Lane)
- Call `playSound()` from `lib/audio.ts` (Audio Lane)
- Update player state for HUD display
- Provide camera position for rendering

## DELIVERABLES
1. Smooth, responsive player controls
2. Enemy AI with collision detection
3. Polished animations and transitions
4. Camera system with smooth follow
5. 60 FPS consistent performance

Remember: Game feel is everything! Make movement satisfying and enemies fun to defeat.