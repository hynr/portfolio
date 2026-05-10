export interface GameState {
  isRunning: boolean
  lastTime: number
  deltaTime: number
  fps: number
  frameCount: number
}

export class GameLoop {
  private state: GameState = {
    isRunning: false,
    lastTime: 0,
    deltaTime: 0,
    fps: 60,
    frameCount: 0,
  }

  private updateCallback: (deltaTime: number) => void = () => {}
  private renderCallback: () => void = () => {}
  private animationId: number = 0

  constructor(
    updateFn: (deltaTime: number) => void,
    renderFn: () => void
  ) {
    this.updateCallback = updateFn
    this.renderCallback = renderFn
  }

  start(): void {
    if (this.state.isRunning) return
    
    this.state.isRunning = true
    this.state.lastTime = performance.now()
    this.loop()
  }

  stop(): void {
    this.state.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  private loop = (): void => {
    if (!this.state.isRunning) return

    const currentTime = performance.now()
    this.state.deltaTime = currentTime - this.state.lastTime
    this.state.lastTime = currentTime

    // Cap delta time to prevent large jumps (e.g., when tab is inactive)
    const cappedDelta = Math.min(this.state.deltaTime, 16.67) // ~60 FPS

    // Update game state
    this.updateCallback(cappedDelta)

    // Render frame
    this.renderCallback()

    // Calculate FPS
    this.state.frameCount++
    if (this.state.frameCount % 60 === 0) {
      this.state.fps = Math.round(1000 / this.state.deltaTime)
    }

    // Schedule next frame
    this.animationId = requestAnimationFrame(this.loop)
  }

  getState(): Readonly<GameState> {
    return { ...this.state }
  }
}