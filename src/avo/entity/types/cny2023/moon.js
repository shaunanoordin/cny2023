import Entity from '@avo/entity'
import { TILE_SIZE } from '@avo/constants'

export default class Moon extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'moon'
    this.colour = '#e0e0c0'
    this.solid = false
    this.movable = false
    this.size = TILE_SIZE * 8
    this.pushMaxSpeed = 0
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    const app = this._app
    const hero = app.hero
    const goals = app.rules['cny2023-goals']

    if (!hero || !goals) return

    if (target === hero) goals.triggerWinScreen()
  }
}
