import Entity from '@avo/entity'
import { SHAPES, TILE_SIZE } from '@avo/constants'

export default class Ground extends Entity {
  constructor (app, col = 0, row = 0, width = 1, height = 1, cutCorner = false) {
    super(app)
    this._type = 'ground'

    this.colour = '#60a080'
    this.solid = true
    this.movable = false
    this.x = col * TILE_SIZE
    this.y = row * TILE_SIZE

    this.shape = SHAPES.POLYGON
    this.shapePolygonPath = []

    if (cutCorner !== 'nw') this.shapePolygonPath.push(0, 0)
    if (cutCorner !== 'ne') this.shapePolygonPath.push(width * TILE_SIZE, 0)
    if (cutCorner !== 'se') this.shapePolygonPath.push(width * TILE_SIZE, height * TILE_SIZE)
    if (cutCorner !== 'sw') this.shapePolygonPath.push(0, height * TILE_SIZE)
  }

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    const app = this._app
    const controls = app.rules['cny2023-controls']
    const goals = app.rules['cny2023-goals']

    if (!controls || !goals) return

    if (target === app.hero) goals.triggerLoseScreen()
  }
}
