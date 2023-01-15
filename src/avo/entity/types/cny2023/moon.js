import Entity from '@avo/entity'
import { LAYERS, TILE_SIZE } from '@avo/constants'

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

  paint (layer = 0) {
    const app = this._app
    const c2d = app.canvas2d
    app.applyCameraTransforms()

    if (layer === LAYERS.ENTITIES_LOWER) {
      const gradient = c2d.createLinearGradient(0, this.top, 0, this.bottom)
      gradient.addColorStop(0, '#e0e0c0')
      gradient.addColorStop(1, '#a0a090')
      c2d.fillStyle = gradient

      c2d.beginPath()
      c2d.arc(this.x, this.y, this.size * 0.5, 0, 2 * Math.PI)
      c2d.closePath()
      c2d.fill()
    }

    app.undoCameraTransforms()
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
