export interface InputState {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  jump: boolean
  run: boolean
  interact: boolean
}

export class InputHandler {
  private keys: Set<string> = new Set()
  private touchState: InputState = this.createEmptyState()

  constructor() {
    this.bindKeyboardEvents()
  }

  private createEmptyState(): InputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      run: false,
      interact: false,
    }
  }

  private bindKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
    })

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })
  }

  getInputState(): InputState {
    return {
      left: this.keys.has('KeyA') || this.keys.has('ArrowLeft') || this.touchState.left,
      right: this.keys.has('KeyD') || this.keys.has('ArrowRight') || this.touchState.right,
      up: this.keys.has('KeyW') || this.keys.has('ArrowUp') || this.touchState.up,
      down: this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.touchState.down,
      jump: this.keys.has('Space') || this.touchState.jump,
      run: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.touchState.run,
      interact: this.keys.has('KeyE') || this.keys.has('Enter') || this.touchState.interact,
    }
  }

  setTouchState(newTouchState: Partial<InputState>): void {
    this.touchState = { ...this.touchState, ...newTouchState }
  }

  cleanup(): void {
    this.keys.clear()
    this.touchState = this.createEmptyState()
  }
}