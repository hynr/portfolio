// Player physics tunables. Co-located with level data so the level designer
// can tweak feel without touching the game module. Values mirror the inline
// constants previously in SimpleMarioGame.tsx; preserve exact numerics until
// the perf refactor lands and the behavior can be re-felt on hardware.
export const PHYSICS = {
  GRAVITY: 1.0,
  GRAVITY_REDUCED: 0.5,
  JUMP_VELOCITY: -18,
  MOVE_SPEED: 6,
  MAX_FALL_SPEED: 15,
  FRICTION: 0.88,
  ACCELERATION: 0.8,
  COYOTE_TIME: 80,
  MAX_JUMP_HOLD: 250,
} as const

export interface Position {
  x: number
  y: number
}

export interface Block extends Position {
  type: 'brick' | 'question' | 'hidden'
  contains?: 'coin' | 'powerup' | 'star' | 'project'
  projectId?: string
}

export interface Coin extends Position {
  collected?: boolean
}

export interface Pipe extends Position {
  height: 1 | 2 | 3
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
  width: number
  height: number
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

export const level_1_1: LevelData = {
  width: 2560,
  height: 576,
  startPosition: { x: 100, y: 400 },
  goalPosition: { x: 2400, y: 400 },
  groundHeight: 450,
  groundVariation: [
    { start: 400, end: 500, height: 430 },
    { start: 1100, end: 1200, height: 420 },
    { start: 1500, end: 1600, height: 410 },
  ],
  blocks: [
    { x: 200, y: 350, type: 'brick' },
    { x: 232, y: 350, type: 'brick' },
    { x: 264, y: 350, type: 'brick' },
    { x: 300, y: 350, type: 'question', contains: 'project', projectId: 'therasort' },
    { x: 1100, y: 250, type: 'brick' },
    { x: 1132, y: 250, type: 'brick' },
    { x: 1164, y: 250, type: 'brick' },
    { x: 1196, y: 250, type: 'brick' },
    { x: 1200, y: 250, type: 'question', contains: 'project', projectId: 'portfolio-mario' },
    { x: 1400, y: 250, type: 'question', contains: 'project', projectId: 'data-pipeline' },
    { x: 1432, y: 250, type: 'brick' },
    { x: 1464, y: 250, type: 'brick' },
    { x: 2100, y: 300, type: 'brick' },
    { x: 2132, y: 300, type: 'brick' },
    { x: 2200, y: 300, type: 'question', contains: 'project', projectId: 'react-dashboard' },
  ],
  coins: [
    { x: 150, y: 380 },
    { x: 180, y: 360 },
    { x: 210, y: 340 },
    { x: 240, y: 320 },
    { x: 270, y: 320 },
    { x: 900, y: 380 },
    { x: 930, y: 350 },
    { x: 960, y: 320 },
    { x: 990, y: 290 },
    { x: 1020, y: 270 },
    { x: 1050, y: 270 },
    { x: 1080, y: 290 },
    { x: 1110, y: 320 },
    { x: 1800, y: 380 },
    { x: 1850, y: 360 },
    { x: 1900, y: 360 },
    { x: 1950, y: 380 },
    // Bonus coins above the cloud platforms — only reachable via clouds
    { x: 540, y: 170 },
    { x: 568, y: 170 },
    { x: 596, y: 170 },
    { x: 1520, y: 150 },
    { x: 1548, y: 150 },
    { x: 1576, y: 150 },
    { x: 2300, y: 190 },
    { x: 2328, y: 190 },
    { x: 2356, y: 190 },
  ],
  pipes: [
    { x: 800, y: 386, height: 2, linkTo: 'github', enterable: false },
    { x: 1600, y: 386, height: 2, linkTo: 'linkedin', enterable: false },
  ],
  platforms: [
    { x: 600, y: 350, width: 96, height: 32, type: 'brick' },
    { x: 750, y: 300, width: 96, height: 32, type: 'brick' },
    { x: 900, y: 250, width: 128, height: 32, type: 'brick' },
    { x: 1300, y: 350, width: 96, height: 32, type: 'brick' },
    { x: 1700, y: 320, width: 128, height: 32, type: 'brick' },
    { x: 1900, y: 280, width: 160, height: 32, type: 'brick' },
    // Bonus cloud platforms — reachable from the brick stairs above
    { x: 520, y: 200, width: 96, height: 16, type: 'cloud' },
    { x: 1500, y: 180, width: 96, height: 16, type: 'cloud' },
    { x: 2280, y: 220, width: 112, height: 16, type: 'cloud' },
  ],
  enemies: [
    // Goomba positions: y aligns to ground (groundHeight - 32). patrolStart
    // and patrolEnd are the x bounds at which the goomba reverses direction
    // — avoids having to solve side-collision against platforms/blocks.
    { x: 700, y: 418, type: 'goomba', patrolStart: 540, patrolEnd: 760, speed: 0.6 },
    { x: 1700, y: 418, type: 'goomba', patrolStart: 1500, patrolEnd: 1850, speed: 0.6 },
    { x: 2050, y: 418, type: 'goomba', patrolStart: 1990, patrolEnd: 2160, speed: 0.7 },
  ],
  decorations: [
    { x: 150, y: 420, type: 'bush', layer: 'foreground' },
    { x: 500, y: 420, type: 'bush', layer: 'foreground' },
    { x: 1250, y: 420, type: 'bush', layer: 'foreground' },
    { x: 200, y: 100, type: 'cloud', layer: 'background' },
    { x: 400, y: 80, type: 'cloud', layer: 'background' },
    { x: 600, y: 120, type: 'cloud', layer: 'background' },
    { x: 800, y: 90, type: 'cloud', layer: 'background' },
    { x: 1000, y: 110, type: 'cloud', layer: 'background' },
    { x: 1200, y: 80, type: 'cloud', layer: 'background' },
    { x: 1400, y: 100, type: 'cloud', layer: 'background' },
    { x: 1600, y: 120, type: 'cloud', layer: 'background' },
    { x: 1800, y: 90, type: 'cloud', layer: 'background' },
    { x: 2000, y: 110, type: 'cloud', layer: 'background' },
    { x: 2200, y: 80, type: 'cloud', layer: 'background' },
    { x: 2400, y: 100, type: 'cloud', layer: 'background' },
  ],
  projects: [
    {
      id: 'therasort',
      title: 'Therasort – AI Therapy Note Parser',
      description: 'Clinical note parser powered by Generative AI for therapy workflow optimization. Uses OpenAI API for intelligent text analysis and MongoDB for data storage.',
      technologies: ['Python', 'OpenAI API', 'MongoDB', 'FastAPI'],
      link: 'https://github.com/hynr/therasort'
    },
    {
      id: 'portfolio-mario',
      title: 'Interactive Mario Portfolio',
      description: 'Dual-mode portfolio website with traditional content view and playable Mario-inspired game mode. Built with Next.js 14 and TypeScript.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'React'],
      link: 'https://portfolio.hzsr.dev'
    },
    {
      id: 'data-pipeline',
      title: 'AWS Data Processing Pipeline',
      description: 'Serverless data processing pipeline for large-scale analytics workloads. Processes millions of records daily with automated error handling.',
      technologies: ['AWS Lambda', 'Python', 'DynamoDB', 'S3'],
    },
    {
      id: 'react-dashboard',
      title: 'Real-time Analytics Dashboard',
      description: 'Modern React dashboard with real-time data visualization and interactive charts. Features WebSocket updates and responsive design.',
      technologies: ['React', 'TypeScript', 'D3.js', 'WebSocket'],
    },
  ],
  theme: 'overworld'
}