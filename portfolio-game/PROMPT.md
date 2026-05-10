# GAME LANE PROMPT
**Branch:** feat/game-mode  
**Role:** Mario-inspired portfolio game implementation

## YOUR MISSION
Build an interactive 2D platform game where the portfolio content becomes collectible/interactive elements. Think Super Mario meets professional portfolio - fun but purposeful.

## CRITICAL RULES
1. **READ CONTRACT.md FIRST** - Treat it as frozen law. Import sprite APIs, don't modify them.
2. **FILE OWNERSHIP** - You ONLY write files in these paths:
   ```
   app/game-mode/            (all game mode files)
   lib/game-engine/          (physics, collision, game logic)  
   styles/game.css           (game-specific styles)
   public/sounds/            (game audio files)
   ```
3. **NO SCOPE EXPANSION** - If CONTRACT.md doesn't cover something, STOP and surface it. Don't improvise.
4. **COMMIT FREQUENTLY** - Every system, every feature, every milestone. Clear messages.
5. **BUILD BEFORE DONE** - Run `npm run build` and fix all errors before declaring complete.

## TECHNICAL REQUIREMENTS

### Game Engine Architecture
- Custom 2D physics engine in `lib/game-engine/`
- Use PHYSICS constants from CONTRACT.md exactly as defined
- 60 FPS target performance
- Canvas or CSS transforms for rendering
- Keyboard input handling (WASD/Arrow keys, Space, Shift)

### Portfolio Game Integration
Transform portfolio content into game elements:
- **Skills** → Collectible power-ups that show skill details
- **Projects** → Question blocks that reveal project info when hit
- **Experience** → NPCs or signs with company/role info
- **Bio/Contact** → End-of-level castle/flag with contact details

### Core Game Features
1. **Player Character** - Mario-inspired sprite with animations
2. **Physics System** - Gravity, jumping, collision detection
3. **Level Design** - Single long level with portfolio content
4. **Collectibles** - Skills as coins/power-ups with info popups
5. **Interactive Blocks** - Projects as question blocks with modal details
6. **Background Elements** - Clouds, bushes, ground tiles for atmosphere
7. **UI Overlay** - Score (skills collected), lives, current section indicator

### Game Mode Component
Provide single mount point as specified in CONTRACT.md:
```typescript
// app/game-mode/GameMode.tsx
export default function GameMode() {
  return <MarioGame />
}
```

### Sprite Integration
Import and use sprites from CONTRACT.md API:
- `<PlayerSprite>` - Main character with states (idle/running/jumping)
- `<BlockSprite>` - Question blocks for projects, brick blocks for decoration  
- `<CoinSprite>` - Skills as collectible coins
- `<PipeSprite>` - Level transitions or decorative elements
- `<CloudSprite>`, `<BushSprite>`, `<GroundTile>` - Environmental decoration

## IMPLEMENTATION CHECKLIST

### Phase 1: Game Engine Foundation
- [ ] Set up game loop with requestAnimationFrame
- [ ] Implement physics system with CONTRACT.md constants
- [ ] Build collision detection system
- [ ] Create keyboard input handling
- [ ] Basic player movement and jumping

### Phase 2: Core Gameplay
- [ ] Player sprite integration with animations
- [ ] World/level layout with ground tiles
- [ ] Gravity and platform collision
- [ ] Collectible system (coins for skills)
- [ ] Interactive blocks (question blocks for projects)

### Phase 3: Portfolio Integration
- [ ] Map skills data to collectible coins
- [ ] Map projects data to question blocks  
- [ ] Info popups/modals when collecting/hitting
- [ ] Experience/bio integration as NPCs or level elements
- [ ] Progress tracking (skills collected, projects discovered)

### Phase 4: Polish & Performance
- [ ] 60 FPS performance optimization
- [ ] Sound effects and background music
- [ ] UI overlay with game stats
- [ ] Level completion state
- [ ] Responsive canvas sizing

### Phase 5: Integration
- [ ] Single GameMode component mount point
- [ ] Clean integration with mode toggle
- [ ] Performance budgets met (60 FPS)
- [ ] Final build success: `npm run build`

## GAME DESIGN GUIDELINES

### Level Layout
```
[Clouds decorating sky]
[Skills as floating coins] [Projects as question blocks]
[==========================================] <- Ground level
[Experience markers] [Pipes] [More collectibles]
[==========================================]
```

### Portfolio Data Mapping
- **Skills** → Coins with skill name/level popup on collect
- **Projects** → Question blocks with project title, hit to show details
- **Experience** → Signs or NPCs with company logos/info
- **Bio** → Castle at end with contact info and "game complete" state

### Performance Requirements  
- Maintain 60 FPS consistently
- Smooth scrolling camera that follows player
- Efficient collision detection (spatial partitioning if needed)
- Sprite animations without frame drops
- Quick load time (<2 seconds to playable)

## PHYSICS IMPLEMENTATION
Use exactly these values from CONTRACT.md:
```typescript
GRAVITY: 0.5           // Applied each frame
JUMP_VELOCITY: -12     // Initial jump boost
MOVE_SPEED: 4          // Base horizontal speed
RUN_SPEED: 6           // Speed when holding shift
MAX_FALL_SPEED: 10     // Terminal velocity
```

## SUCCESS CRITERIA
- Playable 2D platform game at 60 FPS
- Portfolio content meaningfully integrated as game elements
- All sprites properly imported and functional
- Single mount component for clean integration
- Physics feel responsive and Mario-like
- Builds without errors, ready for production
- Only modified files in your ownership paths

## IF YOU GET STUCK
- Contract unclear? STOP and surface the ambiguity
- Need different sprite props? STOP - that's sprite lane territory
- Content mode integration broken? Check your single mount point
- Performance issues? Profile and optimize, but maintain CONTRACT.md physics
- Build failing? Fix all TypeScript/lint errors before proceeding

Remember: Make it fun but purposeful - this game should showcase your portfolio content in an engaging, memorable way! 🎮