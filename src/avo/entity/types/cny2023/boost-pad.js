import Entity from '@avo/entity'
import { LAYERS, SHAPES, TILE_SIZE } from '@avo/constants'

const DEFAULT_BOOST_POWER = 32

export default class BoostPad extends Entity {
  constructor (app, x = 0, y = 0, width = TILE_SIZE, height = TILE_SIZE, boostPower = DEFAULT_BOOST_POWER) {
    super(app)
    this._type = 'boost-pad'

    this.colour = '#c0a040'
    this.solid = false
    this.movable = false
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.shape = SHAPES.POLYGON
    this.shapePolygonPath = []

    this.shapePolygonPath.push(width * -0.5, height * 0.5)
    this.shapePolygonPath.push(width * 0.5, height * 0.5)
    this.shapePolygonPath.push(width * 0.5, height * -0.5)
    this.shapePolygonPath.push(width * -0.5, height * -0.5)

    this.boostPower = boostPower
  }

  paint (layer = 0) {
    // super.paint(layer)

    const app = this._app
    const c2d = this._app.canvas2d
    app.applyCameraTransforms()

    if (layer === LAYERS.ENTITIES_UPPER) {
      const gradient = c2d.createLinearGradient(0, this.y - this.height / 2, 0, this.y + this.height / 2)
      gradient.addColorStop(0, '#e0e0e0')
      gradient.addColorStop(1, '#8080a0')
      c2d.fillStyle = gradient
      //c2d.fillStyle = '#e0e0e0'
      //c2d.beginPath()

      // Central "puff"
      this.paint_circle(0, this.height * 1.2)

      // Programmatically fill up the central "puffs"
      const distanceBetweenSteps = this.height / 2
      const maxSteps = this.width / 2 / distanceBetweenSteps
      for (let step = 1; step < maxSteps ; step++) {
        const size = this.height * ((maxSteps - step) / maxSteps * 0.6 + 0.6)
        const offsetX = step * distanceBetweenSteps
        this.paint_circle(offsetX, size)
        this.paint_circle(-offsetX, size)
      }

      // Edge "puffs"
      this.paint_circle(-this.width / 2, this.height * 0.5)
      this.paint_circle(this.width / 2, this.height * 0.5)

      // Complete!
      // c2d.closePath()
      // c2d.fill()
    }

    app.undoCameraTransforms()
  }

  paint_circle (offsetX = 0, size = this.height) {
    const c2d = this._app.canvas2d
    const offsetY = (size > this.height)
      ? 0
      : (this.height - size) / 2
    c2d.beginPath()
    c2d.arc(this.x + offsetX, this.y + offsetY, size / 2, 0, 2 * Math.PI)
    c2d.closePath()
    c2d.fill()
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    const app = this._app
    const hero = app.hero

    if (target === hero) {
      target.pushY = -this.boostPower
      // this._expired = true  // Add this to crank up the difficulty
    }
  }

  get left () { return this.x - this.width / 2 }
  get right () { return this.x + this.width / 2 }

  set left (val) { this.x = val + this.width / 2 }
  set right (val) { this.x = val - this.width / 2 }
}
