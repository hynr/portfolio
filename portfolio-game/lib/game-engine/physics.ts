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

export interface Vector2D {
  x: number
  y: number
}

export interface PhysicsBody {
  position: Vector2D
  velocity: Vector2D
  width: number
  height: number
  onGround: boolean
  mass?: number
}

export class PhysicsEngine {
  static applyGravity(body: PhysicsBody): void {
    if (!body.onGround) {
      body.velocity.y += PHYSICS.GRAVITY
      if (body.velocity.y > PHYSICS.MAX_FALL_SPEED) {
        body.velocity.y = PHYSICS.MAX_FALL_SPEED
      }
    }
  }

  static applyFriction(body: PhysicsBody): void {
    if (body.onGround) {
      body.velocity.x *= PHYSICS.FRICTION
    } else {
      body.velocity.x *= PHYSICS.AIR_RESISTANCE
    }
  }

  static updatePosition(body: PhysicsBody): void {
    body.position.x += body.velocity.x
    body.position.y += body.velocity.y
  }

  static checkGroundCollision(body: PhysicsBody, groundY: number): void {
    if (body.position.y + body.height >= groundY) {
      body.position.y = groundY - body.height
      body.velocity.y = 0
      body.onGround = true
    } else {
      body.onGround = false
    }
  }

  static checkAABBCollision(a: PhysicsBody, b: PhysicsBody): boolean {
    return (
      a.position.x < b.position.x + b.width &&
      a.position.x + a.width > b.position.x &&
      a.position.y < b.position.y + b.height &&
      a.position.y + a.height > b.position.y
    )
  }
}