# Level Design Lane - PROMPT

You are working on the **Level Design Lane** for a Mario-inspired portfolio game. Your responsibility is creating the level layout, placing collectibles, and designing the visual environment.

## CONTRACT
Read CONTRACT.md first. You own these files:
- `lib/level-data.ts` - Level layouts and data
- `components/sprites/BlockSprite.tsx` - Block rendering
- `components/sprites/CoinSprite.tsx` - Coin rendering  
- `components/sprites/PipeSprite.tsx` - Pipe rendering
- `components/sprites/PlatformSprite.tsx` - Platform rendering
- `components/sprites/DecorationSprite.tsx` - Background elements
- `components/game/LevelRenderer.tsx` - Renders level elements

## YOUR TASKS

### 1. Create Level Data Structure
In `lib/level-data.ts`:
- Design a 6400px wide level with varied terrain
- Place platforms at different heights for jumping challenges
- Add coins in patterns (arcs, lines, hidden areas)
- Place question blocks containing project info
- Position pipes linking to GitHub, LinkedIn, Email, Resume
- Add decorative elements (bushes, clouds, hills)
- Create ground height variations (gaps, hills)

### 2. Implement Sprite Components
Create pixel-art style sprites using CSS/Canvas:
- **BlockSprite**: Brick blocks, question blocks (yellow with ?), hidden blocks
- **CoinSprite**: Spinning gold coins with animation
- **PipeSprite**: Green pipes (3 heights) with shading
- **PlatformSprite**: Grass, brick, and cloud platforms  
- **DecorationSprite**: Bushes, clouds, hills in background

### 3. Create Level Renderer
In `components/game/LevelRenderer.tsx`:
- Render all level elements based on camera position
- Handle parallax scrolling for background layers
- Optimize rendering (only draw visible elements)
- Manage z-ordering (background → platforms → items → foreground)

## DESIGN GUIDELINES

### Visual Style
- 16-bit pixel art aesthetic
- Bright, cheerful color palette
- Clear visual hierarchy
- Consistent 32px tile size

### Level Progression
1. **Opening (0-800px)**: Easy intro, teach jumping
2. **Skills Section (800-2400px)**: Coins spell out skills, platforms showcase categories
3. **Projects Section (2400-4800px)**: Question blocks with project info, challenging platforming
4. **Contact Section (4800-6000px)**: Pipes to social links
5. **Finale (6000-6400px)**: Victory flag/castle

### Collectible Placement
- Coins guide the optimal path
- Hidden coins reward exploration
- Question blocks at key locations
- Total coins: 100-150

### Enemy Placement Guidelines (for Physics Lane)
Place markers for enemies but don't implement AI:
- Goombas on flat sections
- Koopas on platforms
- Flying Koopas in open areas

## INTEGRATION POINTS
Your level data will be consumed by:
- Physics Lane: For collision detection
- Audio Lane: For sound triggers
- Both read from `lib/level-data.ts`

## DELIVERABLES
1. Complete level data in `lib/level-data.ts`
2. All sprite components implemented
3. Level renderer with camera support
4. Visual polish (animations, effects)

Remember: You're creating the world that showcases Huzaifa's portfolio in a fun, interactive way. Make it memorable!