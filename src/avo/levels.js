import {
  PLAYER_ACTIONS, DIRECTIONS,
  CNY2023_COLS, CNY2023_ROWS,
  TILE_SIZE
} from '@avo/constants'

import Rabbit from '@avo/entity/types/cny2023/rabbit'
import Moon from '@avo/entity/types/cny2023/moon'
import Ground from '@avo/entity/types/cny2023/ground'
import BoostPad from '@avo/entity/types/cny2023/boost-pad'
import Coin from '@avo/entity/types/cny2023/coin'

import CNY2023Controls from '@avo/rule/types/cny2023-controls'
import CNY2023Goals from '@avo/rule/types/cny2023-goals'

const MIN_X = 0
const MAX_X = CNY2023_COLS * TILE_SIZE
const MID_X = (MAX_X + MIN_X) / 2
const ROWS_BETWEEN_BOOSTSPADS = 8
const FIRST_BOOST_PAD_WIDTH = 8 * TILE_SIZE

export const CNY2023_CEILING_ROW = -100
export const CNY2023_CEILING_Y = CNY2023_CEILING_ROW * TILE_SIZE
export const CNY2023_FLOOR_Y = CNY2023_ROWS * TILE_SIZE

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 0
    this.firstBoostPad = undefined  // CNY2023
  }

  reset () {
    const app = this._app
    app.hero = undefined
    app.entities = []
    app.clearRules()
    app.camera.target = null
    app.camera.x = 0
    app.camera.y = 0
    app.camera.zoom = 1
    app.playerAction = PLAYER_ACTIONS.IDLE
    app.setInteractionMenu(false)

    this.firstBoostPad = undefined
  }

  load (level = 0) {
    const app = this._app
    this.current = level

    this.reset()
    this.generate_default()
  }

  reload () {
    this.load(this.current)
  }

  /*
  Default level.
   */
  generate_default () {
    const app = this._app

    app.addRule(new CNY2023Controls(app))
    app.addRule(new CNY2023Goals(app))

    // Rabbit
    app.hero = app.addEntity(new Rabbit(app, (CNY2023_COLS-1) / 2, 1))
    app.camera.x = 0
    app.camera.y = 0
    //app.camera.target = app.hero

    // Moon
    app.addEntity(new Moon(app, (CNY2023_COLS-1) / 2, CNY2023_CEILING_ROW - 8))

    // Ground
    app.addEntity(new Ground(app, 0, CNY2023_ROWS - 1, CNY2023_COLS, 1))

    // Main boost pad
    this.firstBoostPad = app.addEntity(new BoostPad(
      app,
      CNY2023_COLS / 2 * TILE_SIZE,  // Middle
      (CNY2023_ROWS - 1.5) * TILE_SIZE,
      FIRST_BOOST_PAD_WIDTH,
      TILE_SIZE
    ))

    // Bounce pads
    let prevBoostPad = this.firstBoostPad
    for (let y = TILE_SIZE * 4 ; y >= CNY2023_CEILING_Y ; y -= (TILE_SIZE * ROWS_BETWEEN_BOOSTSPADS)) {
      prevBoostPad = this.createBoostPad(y, prevBoostPad)
    }

    // Coins
    for (let y = TILE_SIZE * 4 ; y >= CNY2023_CEILING_Y ; y -= (TILE_SIZE * ROWS_BETWEEN_BOOSTSPADS)) {
      this.createCoin(y + TILE_SIZE * 2)
    }
  }

  createBoostPad (y = 0, prevBoostPad = null) {
    const app = this._app

    const BUFFER = TILE_SIZE * 8
    const MIN_WIDTH = 6 * TILE_SIZE
    const MAX_WIDTH = 12 * TILE_SIZE
    const width = Math.random() * (MAX_WIDTH - MIN_WIDTH) + MIN_WIDTH
    const height = TILE_SIZE

    // Try to place the new boost pad a small distance away from the previous one
    const MIN_DIST = 2 * TILE_SIZE
    const MAX_DIST = 8 * TILE_SIZE
    const distFromPrev = Math.random() * (MAX_DIST - MIN_DIST) + MIN_DIST
    const leftOrRight = (Math.random() < 0.5) ? -1 : 1

    let x = (prevBoostPad) ? prevBoostPad.x : MID_X
    x = x + distFromPrev * leftOrRight
    x = Math.min(Math.max(x, MIN_X), MAX_X)

    const boostPad = app.addEntity(new BoostPad(app, x, y, width, height))
    const firstPad = this.firstBoostPad

    // Make sure the bottom few boost pads don't block the space directly above
    // the first/initial boost pad.
    if (y >= 0) {
      if (
        (firstPad.left < boostPad.right && boostPad.right < firstPad.right) ||
        (firstPad.left < boostPad.x && boostPad.x < firstPad.right)
      ) {
        boostPad.right = this.firstBoostPad.left
      } else if (
        (firstPad.left < boostPad.left && boostPad.left < firstPad.right) ||
        (firstPad.left < boostPad.x && boostPad.x < firstPad.right)
      ) {
        boostPad.left = this.firstBoostPad.right
      }
    }

    return boostPad
  }

  createCoin (y = 0) {
    const app = this._app

    const BUFFER = TILE_SIZE * 2
    const x = Math.random() * (MAX_X - MIN_X - BUFFER * 2) + MIN_X + BUFFER

    app.addEntity(new Coin(app, x, y))
  }
}
