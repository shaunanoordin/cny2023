import Entity from '@avo/entity'
import { SHAPES, TILE_SIZE } from '@avo/constants'

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

    this.shape = SHAPES.POLYGON
    this.shapePolygonPath = []

    this.shapePolygonPath.push(width * -0.5, height * 0.5)
    this.shapePolygonPath.push(width * 0.5, height * 0.5)
    this.shapePolygonPath.push(width * 0.5, height * -0.5)
    this.shapePolygonPath.push(width * -0.5, height * -0.5)

    this.boostPower = boostPower
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
}
