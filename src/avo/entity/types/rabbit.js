import Entity from '@avo/entity'
import { TILE_SIZE } from '@avo/constants'

export default class Rabbit extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    this._type = 'rabbit'
    this.colour = '#c06060'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
}

  /*
  Section: General Logic
  ----------------------------------------------------------------------------
   */

  play (timeStep) {
    const app = this._app
    super.play(timeStep)
  }

  paint (layer = 0) {
    const app = this._app
    super.paint(layer)
  }

  /*
  Section: Gameplay Logic
  ----------------------------------------------------------------------------
   */

  onCollision (target, collisionCorrection) {
    super.onCollision(target, collisionCorrection)

    if (target._type === 'bounce-pad') {
      this.pushY = this.pushY * 2
    }
  }

  /*
  Section: Animation
  ----------------------------------------------------------------------------
   */
  getSpriteCol () {}

  getSpriteRow () {}
}
