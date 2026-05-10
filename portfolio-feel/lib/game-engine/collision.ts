import { PhysicsBody, Vector2D, COLLISION } from './physics'

export interface CollisionResult {
  hasCollision: boolean
  penetrationX: number
  penetrationY: number
  normal: Vector2D
}

export interface Platform {
  x: number
  y: number
  width: number
  height: number
  solid: boolean
}

export interface Collectible {
  x: number
  y: number
  width: number
  height: number
  collected: boolean
  type: 'coin' | 'powerup'
  data?: any
}

export interface Interactive {
  x: number
  y: number
  width: number
  height: number
  hit: boolean
  type: 'block' | 'question'
  data?: any
}

export class CollisionSystem {
  static checkAABB(a: PhysicsBody, b: Platform | Collectible | Interactive): boolean {
    return (
      a.position.x < b.x + b.width &&
      a.position.x + a.width > b.x &&
      a.position.y < b.y + b.height &&
      a.position.y + a.height > b.y
    )
  }

  static resolveCollision(body: PhysicsBody, platform: Platform): CollisionResult {
    if (!this.checkAABB(body, platform)) {
      return {
        hasCollision: false,
        penetrationX: 0,
        penetrationY: 0,
        normal: { x: 0, y: 0 }
      }
    }

    const overlapX = Math.min(
      body.position.x + body.width - platform.x,
      platform.x + platform.width - body.position.x
    )

    const overlapY = Math.min(
      body.position.y + body.height - platform.y,
      platform.y + platform.height - body.position.y
    )

    let normal: Vector2D = { x: 0, y: 0 }
    let penetrationX = 0
    let penetrationY = 0

    // Determine collision direction based on smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      penetrationX = overlapX
      if (body.position.x < platform.x) {
        normal.x = -1 // Hit from left
        body.position.x = platform.x - body.width
      } else {
        normal.x = 1 // Hit from right
        body.position.x = platform.x + platform.width
      }
      body.velocity.x = 0
    } else {
      // Vertical collision
      penetrationY = overlapY
      if (body.position.y < platform.y) {
        normal.y = -1 // Hit from above
        body.position.y = platform.y - body.height
        body.velocity.y = 0
        body.onGround = true
      } else {
        normal.y = 1 // Hit from below
        body.position.y = platform.y + platform.height
        body.velocity.y = 0
      }
    }

    return {
      hasCollision: true,
      penetrationX,
      penetrationY,
      normal
    }
  }

  static checkPlatformCollisions(body: PhysicsBody, platforms: Platform[]): void {
    body.onGround = false
    
    for (const platform of platforms) {
      if (platform.solid) {
        this.resolveCollision(body, platform)
      } else {
        // One-way platforms (can jump through from below)
        if (body.velocity.y >= 0 && 
            body.position.y < platform.y && 
            this.checkAABB(body, platform)) {
          body.position.y = platform.y - body.height
          body.velocity.y = 0
          body.onGround = true
        }
      }
    }
  }

  static checkCollectibles(body: PhysicsBody, collectibles: Collectible[]): Collectible[] {
    const collected: Collectible[] = []
    
    for (const item of collectibles) {
      if (!item.collected && this.checkAABB(body, item)) {
        const distance = Math.sqrt(
          Math.pow(body.position.x + body.width/2 - (item.x + item.width/2), 2) +
          Math.pow(body.position.y + body.height/2 - (item.y + item.height/2), 2)
        )
        
        if (distance <= COLLISION.PICKUP_RADIUS) {
          item.collected = true
          collected.push(item)
        }
      }
    }
    
    return collected
  }

  static checkInteractives(body: PhysicsBody, interactives: Interactive[]): Interactive[] {
    const hit: Interactive[] = []
    
    for (const item of interactives) {
      if (!item.hit && this.checkAABB(body, item)) {
        // Check if hitting from below (player jumping into block)
        if (body.velocity.y < 0 && body.position.y > item.y) {
          item.hit = true
          hit.push(item)
          body.velocity.y = 0 // Stop upward movement
        }
      }
    }
    
    return hit
  }
}