# Audio & Navigation Lane - PROMPT

You are working on the **Audio & Navigation Lane** for a Mario-inspired portfolio game. Your responsibility is sound effects, music, HUD, and pipe navigation.

## CONTRACT
Read CONTRACT.md first. You own these files:
- `lib/audio.ts` - Sound implementation
- `lib/navigation.ts` - Link handling
- `components/game/HUD.tsx` - Score, timer, coins display
- `components/game/PauseMenu.tsx` - Pause screen
- `components/audio/AudioManager.tsx` - Sound system
- `components/audio/MusicPlayer.tsx` - Background music

## YOUR TASKS

### 1. Implement Sound System
In `lib/audio.ts`:
- Implement the `playSound()` function for all events
- Add mute/volume controls
- Preload all sound effects
- Handle concurrent sounds
- Implement music tracks

Sound events to implement:
- `jump` - Player jumps
- `land` - Player lands
- `coin` - Collect coin
- `block-hit` - Hit question block
- `block-reveal` - Item appears from block
- `footstep` - Walking sound
- `pipe-enter` - Enter pipe
- `enemy-stomp` - Defeat enemy
- `damage` - Player takes damage
- `die` - Game over
- `level-complete` - Reach goal
- `pause` - Pause game

### 2. Create Background Music
In `components/audio/MusicPlayer.tsx`:
- Main theme (upbeat, looping)
- Underground theme (for pipe sections)
- Victory fanfare
- Smooth transitions between tracks
- Tempo changes for low time

### 3. Implement HUD
In `components/game/HUD.tsx`:
- Score display (coins collected)
- Coin counter
- Timer (optional)
- Lives counter
- Current section indicator
- Pause button
- Mute toggle

HUD Layout:
```
HUZAIFA          WORLD 1-1         TIME
000000      🪙 × 00                400
```

### 4. Create Pause Menu
In `components/game/PauseMenu.tsx`:
- Pause/Resume functionality
- Sound settings
- Controls display
- Return to main menu option
- Semi-transparent overlay

### 5. Wire Pipe Navigation
In `lib/navigation.ts`:
- Handle pipe clicks to external links
- Play pipe sound effect
- Smooth transition animation
- Open links in new tabs

Pipe destinations:
- GitHub → https://github.com/hynr
- LinkedIn → https://linkedin.com/in/huzaifa-naroo  
- Email → mailto:huzaifa478@gmail.com
- Resume → /resume.pdf

## AUDIO GUIDELINES

### Sound Design Principles:
- **Nostalgic**: 8-bit/16-bit style sounds
- **Clear**: Each sound distinct and recognizable
- **Balanced**: No sound overpowers others
- **Responsive**: Instant audio feedback

### Music Requirements:
- Loopable background tracks
- Dynamic layers (add percussion when running)
- Victory fanfare on completion
- Smooth fade transitions

### Implementation Notes:
- Use Web Audio API for low latency
- Preload all assets on game start
- Handle browser autoplay policies
- Provide fallback for no audio support

## INTEGRATION POINTS
- Listen for events from GameEngine
- Read score/coin data for HUD
- Provide pause state to GameEngine
- Handle pipe onClick from Level Lane

## DELIVERABLES
1. Full sound effect implementation
2. Background music system
3. Polished HUD with all game stats
4. Pause menu with settings
5. Pipe navigation to portfolio links

Remember: Audio brings the game to life! Make every action feel impactful with sound.