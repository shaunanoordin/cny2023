import Entity from '@avo/entity'
import { SHAPES, TILE_SIZE } from '@avo/constants'

const DEFAULT_BOOST_POWER = 32

export default class BoostPad extends Entity {
  constructor (app, col = 0, row = 0, width = 1, height = 1, cutCorner = false, boostPower = DEFAULT_BOOST_POWER) {
    super(app)
    this._type = 'boost-pad'

    this.colour = '#c0a040'
    this.solid = false
    this.movable = false
    this.x = col * TILE_SIZE
    this.y = row * TILE_SIZE

    this.shape = SHAPES.POLYGON
    this.shapePolygonPath = []

    if (cutCorner !== 'nw') this.shapePolygonPath.push(0, 0)
    if (cutCorner !== 'ne') this.shapePolygonPath.push(width * TILE_SIZE, 0)
    if (cutCorner !== 'se') this.shapePolygonPath.push(width * TILE_SIZE, height * TILE_SIZE)
    if (cutCorner !== 'sw') this.shapePolygonPath.push(0, height * TILE_SIZE)

    this.boostPower = boostPower
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    target.pushY = -this.boostPower
  }
}
