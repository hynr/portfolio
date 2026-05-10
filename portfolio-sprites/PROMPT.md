# SPRITES LANE PROMPT
**Branch:** feat/sprites  
**Role:** Shared sprite component implementation

## YOUR MISSION
Build pixel-perfect sprite components that both content and game modes can import. These are the shared visual building blocks that make the portfolio cohesive across modes.

## CRITICAL RULES
1. **READ CONTRACT.md FIRST** - Treat it as frozen law. Implement exact prop signatures.
2. **FILE OWNERSHIP** - You ONLY write files in these paths:
   ```
   components/sprites/       (all sprite components)
   styles/sprites.css        (sprite-specific styles)
   public/sprites/           (sprite assets if using images)
   ```
3. **NO SCOPE EXPANSION** - If CONTRACT.md doesn't cover something, STOP and surface it. Don't improvise.
4. **COMMIT FREQUENTLY** - Every sprite component, every animation. Clear messages.
5. **BUILD BEFORE DONE** - Run `npm run build` and fix all errors before declaring complete.

## TECHNICAL REQUIREMENTS

### Sprite Component Architecture
- React components with TypeScript
- Exact prop interfaces from CONTRACT.md Section 2
- CSS-based rendering (transforms, animations)
- 60 FPS smooth animations where applicable
- Responsive to different game/content contexts

### Required Sprite Components

#### 1. PlayerSprite
```typescript
interface PlayerSpriteProps {
  x: number; y: number; width: number; height: number
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'crouching'
  direction: 'left' | 'right'
  frame?: number; className?: string
}
```
- Mario-inspired character design
- Smooth state transitions and animations
- Frame-based animation for running cycle
- Directional sprite flipping

#### 2. BlockSprite  
```typescript
interface BlockSpriteProps {
  x: number; y: number; width: number; height: number
  type: 'brick' | 'question' | 'solid' | 'invisible'
  hit?: boolean; empty?: boolean; className?: string
}
```
- Classic Mario block styles
- Hit animation when interacted with
- Question mark animation (rotating/pulsing)
- Empty state for depleted question blocks

#### 3. PipeSprite
```typescript
interface PipeSpriteProps {
  x: number; y: number; width: number; height: number
  variant: 'small' | 'medium' | 'large'
  direction?: 'up' | 'down' | 'left' | 'right'
  enterable?: boolean; className?: string  
}
```
- Green Mario-style pipes
- Multiple sizes and orientations
- Enterable pipes with visual indicator
- Proper depth/shadow for 3D appearance

#### 4. CoinSprite
```typescript
interface CoinSpriteProps {
  x: number; y: number; size: number
  spinning?: boolean; collected?: boolean; className?: string
}
```
- Classic spinning coin animation
- Collection animation (scale up + fade out)
- Golden yellow color scheme
- Smooth rotation keyframes

#### 5. CloudSprite
```typescript
interface CloudSpriteProps {
  x: number; y: number; width: number; height: number
  variant: 'small' | 'medium' | 'large'
  opacity?: number; className?: string
}
```
- Fluffy pixel-art clouds
- Multiple size variants
- Parallax-ready (opacity control)
- Subtle floating animation

#### 6. BushSprite
```typescript
interface BushSpriteProps {
  x: number; y: number; width: number; height: number
  variant: 'single' | 'double' | 'triple'
  className?: string
}
```
- Ground-level decorative bushes
- Single, double, triple bush clusters
- Green foliage with darker outlines
- Mario-authentic pixel styling

#### 7. GroundTile
```typescript
interface GroundTileProps {
  x: number; y: number; width: number; height: number
  type: 'grass' | 'dirt' | 'stone'
  pattern?: 'top' | 'middle' | 'bottom'
  className?: string
}
```
- Tileable ground surfaces
- Grass top, dirt middle, stone bottom patterns
- Seamless tiling when placed adjacent
- Underground/surface variations

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up sprite component structure in `components/sprites/`
- [ ] Create base sprite CSS classes in `styles/sprites.css`
- [ ] Establish pixel-perfect positioning system
- [ ] Set up animation keyframes and transitions

### Phase 2: Core Sprites
- [ ] PlayerSprite with all states and animations
- [ ] BlockSprite with type variations and hit states
- [ ] CoinSprite with spinning and collection animations
- [ ] GroundTile with tileable patterns

### Phase 3: Environmental Sprites  
- [ ] PipeSprite with size/direction variants
- [ ] CloudSprite with parallax opacity support
- [ ] BushSprite with clustering variants
- [ ] Sprite interaction and hover states

### Phase 4: Polish & Performance
- [ ] 60 FPS animation performance
- [ ] Pixel-perfect rendering at all sizes
- [ ] Consistent art style across all sprites
- [ ] Accessibility considerations (reduced motion)

### Phase 5: Integration Testing
- [ ] Export all sprites with exact CONTRACT.md APIs
- [ ] Test rendering in both game and content contexts
- [ ] Verify no prop signature mismatches
- [ ] Final build success: `npm run build`

## DESIGN GUIDELINES

### Art Style
- **Pixel Perfect** - Sharp edges, no anti-aliasing on sprites
- **Mario Inspired** - Classic Nintendo aesthetic but original art
- **Consistent Palette** - Limited color scheme across all sprites
- **Readable** - Clear visual hierarchy and contrast

### Animation Principles
- **Smooth 60 FPS** - No jank or frame drops
- **Purposeful** - Animations serve gameplay or visual feedback
- **Performant** - CSS transforms/opacity only, avoid layout thrashing
- **Accessible** - Respect prefers-reduced-motion

### Technical Constraints
- **Pure CSS** - No external sprite sheets or complex image assets
- **Responsive** - Work at different scales (game vs content mode)
- **Lightweight** - Minimal DOM nodes and CSS rules
- **Composable** - Easy to position and layer

## SPRITE SPECIFICATIONS

### Color Palette
```css
/* Primary Colors */
--sprite-player-red: #ff6b6b;
--sprite-player-blue: #4ecdc4;
--sprite-block-brown: #8b4513;
--sprite-block-yellow: #ffd700;
--sprite-ground-green: #228b22;
--sprite-ground-brown: #8b7355;
--sprite-pipe-green: #32cd32;
--sprite-coin-gold: #ffd700;
--sprite-cloud-white: #f8f8ff;
```

### Animation Timing
```css
/* Standard Durations */
--sprite-idle-cycle: 2s;
--sprite-run-cycle: 0.8s;
--sprite-coin-spin: 1.5s;
--sprite-collect-fade: 0.5s;
--sprite-hit-bounce: 0.3s;
```

## SUCCESS CRITERIA
- All 7 sprite components implemented with exact CONTRACT.md APIs
- Pixel-perfect Mario-inspired art style
- Smooth 60 FPS animations where applicable  
- Work correctly in both game and content contexts
- Clean, composable, responsive design
- Builds without errors, ready for import
- Only modified files in your ownership paths

## IF YOU GET STUCK
- Contract unclear? STOP and surface the ambiguity
- Need different prop signatures? STOP - that breaks the contract
- Performance issues? Optimize CSS, avoid JavaScript animations
- Art direction questions? Stick to Mario-inspired pixel aesthetic
- Build failing? Fix all TypeScript/lint errors before proceeding

Remember: These sprites are the visual foundation for both modes. Make them beautiful, performant, and exactly to spec! 🎨