import Rule from '@avo/rule'
import { CNY2023_COLS, CNY2023_ROWS, LAYERS, TILE_SIZE } from '@avo/constants'

const ANIMATION_MID = 200
const ANIMATION_MAX = 5000
const MIN_X = 0
const MIN_Y = 0
const MAX_X = CNY2023_COLS * TILE_SIZE  // Canvas width
const MAX_Y = CNY2023_ROWS * TILE_SIZE  // Canvas height
const IMAGE_WIDTH = 1280
const IMAGE_HEIGHT = 640

const HUD_SCREEN_EDGE_X_OFFSET = TILE_SIZE * 1.5
const HUD_SCREEN_EDGE_Y_OFFSET = TILE_SIZE * -1.0
const FLOOR_HEIGHT_OFFSET = (CNY2023_ROWS - 1.5) * TILE_SIZE

/*
This Rule keeps track of scores and the win/lose condition.
 */
export default class CNY2023Goals extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2023-goals'

    this.win = false
    this.lose = false
    this.animationCounter = 0

    this.score = 0
  }

  play (timeStep) {
    if (this.win || this.lose) {
      this.animationCounter = Math.min(this.animationCounter + timeStep, ANIMATION_MAX)
    }

    if (this.animationCounter >= ANIMATION_MAX) {
      // TODO: show home screen
    }
  }

  paint (layer = 0) {
    if (layer !== LAYERS.HUD) return

    const app = this._app
    const hero = app.hero
    const c2d = app.canvas2d
    let imageAsset = undefined

    if (!this.win && !this.lose) {

      // Paint the current score
      // ----------------
      const LEFT = HUD_SCREEN_EDGE_X_OFFSET
      const RIGHT = app.canvasWidth - HUD_SCREEN_EDGE_X_OFFSET
      const BOTTOM = app.canvasHeight + HUD_SCREEN_EDGE_Y_OFFSET
      c2d.font = '2em Source Code Pro'
      c2d.textBaseline = 'bottom'
      c2d.lineWidth = 8

      const jumpHeight = (hero)
        ? FLOOR_HEIGHT_OFFSET - hero.y
        : 0
      const jumpHeightInMetres = jumpHeight / TILE_SIZE
      let text = `${(jumpHeightInMetres).toFixed(0)}m`
      c2d.textAlign = 'right'
      c2d.strokeStyle = '#fff'
      c2d.strokeText(text, RIGHT, BOTTOM)
      c2d.fillStyle = '#c44'
      c2d.fillText(text, RIGHT, BOTTOM)

      text = `Score: ${this.score}`
      c2d.textAlign = 'left'
      c2d.strokeStyle = '#fff'
      c2d.strokeText(text, LEFT, BOTTOM)
      c2d.fillStyle = '#c44'
      c2d.fillText(text, LEFT, BOTTOM)
      // ----------------

    } else {

      // Paint Win or Lose screens
      // ----------------
      if (this.win) imageAsset = app.assets['win']
      if (this.lose) imageAsset = app.assets['lose']
      if (!imageAsset) return

      const progress = Math.min(this.animationCounter / ANIMATION_MID, 1.0)
      const sizeFactor = progress * 0.6 + 0.2

      const sizeX = IMAGE_WIDTH * sizeFactor
      const sizeY = IMAGE_HEIGHT * sizeFactor
      const tgtX = (MAX_X - sizeX) / 2
      const tgtY = (MAX_Y - sizeY) / 2

      c2d.drawImage(imageAsset.img,
        tgtX, tgtY, sizeX, sizeY
      )
      // ----------------
    }

  }

  triggerWinScreen () {
    if (this.win || this.lose) return  // Don't trigger more than once
    this.win = true

    console.log('WIN')
  }

  triggerLoseScreen () {
    if (this.win || this.lose) return  // Don't trigger more than once
    this.lose = true

    console.log('LOSE')
  }

  increaseScore () {
    if (this.win || this.lose) return
    this.score ++
  }
}
