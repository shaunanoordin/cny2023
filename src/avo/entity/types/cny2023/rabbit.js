import Entity from '@avo/entity'
import { DIRECTIONS, LAYERS, TILE_SIZE } from '@avo/constants'

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
    const c2d = app.canvas2d
    const animationSpriteSheet = app.assets['sprites']
    if (!animationSpriteSheet) return

    app.applyCameraTransforms()

    const FLIP_SPRITE = (this.direction === DIRECTIONS.WEST) ? -1 : 1
    const SPRITE_SCALE = 3
    const SPRITE_SIZE = 32

    // Draw the sprite
    if (layer === LAYERS.ENTITIES_UPPER) {
      const srcX = this.getSpriteCol() * SPRITE_SIZE
      const srcY = this.getSpriteRow() * SPRITE_SIZE
      const sizeX = SPRITE_SIZE
      const sizeY = SPRITE_SIZE

      c2d.translate(this.x, this.y)  // 1. This moves the 'drawing origin' to match the position of (the centre of) the Entity.
      c2d.scale(SPRITE_SCALE * FLIP_SPRITE, SPRITE_SCALE)  // 2. This ensures the sprite scales with the 'drawing origin' as the anchor point.
      // c2d.rotate(this.rotation)  // 3. If we wanted to, we could rotate the sprite around the 'drawing origin'.

      // 4. tgtX and tgtY specify where to draw the sprite, relative to the 'drawing origin'.
      const tgtX = -sizeX / 2  // Align centre of sprite to origin
      const tgtY = -sizeY / 2  // Align centre sprite to origin

      c2d.drawImage(animationSpriteSheet.img,
        srcX, srcY, sizeX, sizeY,
        tgtX, tgtY, sizeX, sizeY
      )
    }

    this._app.undoCameraTransforms()
  }

  /*
  Section: Animation
  ----------------------------------------------------------------------------
   */
  getSpriteCol () {
    return 0
  }

  getSpriteRow () {
    return (this.pushY < 0) ? 0 : 1
  }
}
