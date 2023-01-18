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

export const CNY2023_CEILING_ROW = -160
export const CNY2023_CEILING_Y = CNY2023_CEILING_ROW * TILE_SIZE
export const CNY2023_FLOOR_Y = CNY2023_ROWS * TILE_SIZE

const CNY2023_HIGHSCORE_STORAGE_KEY = 'cny2023.highscores'

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 0

    // CNY2023
    this.firstBoostPad = undefined
    this.cny2023HighScores = [undefined]
    this.loadCNY2023HighScores()
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
    const DISTANCE_BETWEEN_BOOSTSPADS = 8 * TILE_SIZE
    const FIRST_BOOST_PAD_WIDTH = 8 * TILE_SIZE

    app.addRule(new CNY2023Controls(app))
    app.addRule(new CNY2023Goals(app))

    // Rabbit
    app.hero = app.addEntity(new Rabbit(app, (CNY2023_COLS-1) / 2, 1))
    app.camera.x = 0
    app.camera.y = 0
    //app.camera.target = app.hero

    // Moon
    app.addEntity(new Moon(app, (CNY2023_COLS-1) / 2, CNY2023_CEILING_ROW - 4))

    // Ground
    app.addEntity(new Ground(app, CNY2023_COLS * -0.5, CNY2023_ROWS - 1, CNY2023_COLS * 2, 16))

    // Main boost pad
    this.firstBoostPad = app.addEntity(new BoostPad(
      app,
      CNY2023_COLS / 2 * TILE_SIZE,  // Middle
      (CNY2023_ROWS - 1.5) * TILE_SIZE,
      FIRST_BOOST_PAD_WIDTH,
      TILE_SIZE
    ))

    // Create Bounce Pads and Coins
    let prevBoostPad = this.firstBoostPad
    for (let y = TILE_SIZE * 4 ; y >= CNY2023_CEILING_Y ; y -= DISTANCE_BETWEEN_BOOSTSPADS) {
      prevBoostPad = this.createBoostPad(y, prevBoostPad)

      if (y < 0) {  // Only create coins at a certain height
        this.createCoin(y - DISTANCE_BETWEEN_BOOSTSPADS / 2)
      }
    }
  }

  createBoostPad (y = 0, prevBoostPad = null) {
    const app = this._app

    const BUFFER = TILE_SIZE * 8
    const MIN_WIDTH = 6 * TILE_SIZE
    const MAX_WIDTH = 12 * TILE_SIZE
    const MIN_X = 0
    const MID_X = app.canvasWidth / 2
    const MAX_X = app.canvasWidth
    const width = Math.random() * (MAX_WIDTH - MIN_WIDTH) + MIN_WIDTH
    const height = TILE_SIZE

    // Try to place the new boost pad a small distance away from the previous one
    const MIN_DIST = 2 * TILE_SIZE
    const MAX_DIST = 8 * TILE_SIZE
    const distFromPrev = Math.random() * (MAX_DIST - MIN_DIST) + MIN_DIST
    const leftOrRight = (function skewTowardsCentre() {
      if (prevBoostPad && prevBoostPad.x < MID_X) {
        return (Math.random() < 0.4) ? -1 : 1
      } else if (prevBoostPad && prevBoostPad.x > MID_X) {
        return (Math.random() < 0.6) ? -1 : 1
      }
      return (Math.random() < 0.5) ? -1 : 1
    })()

    let x = (prevBoostPad) ? prevBoostPad.x : MID_X
    x = x + distFromPrev * leftOrRight
    x = Math.min(Math.max(x, MIN_X), MAX_X)

    const boostPad = app.addEntity(new BoostPad(app, x, y, width, height))
    const firstPad = this.firstBoostPad

    // Make sure the boost pads don't go off-screen
    if (boostPad.left < MIN_X) boostPad.left = MIN_X
    if (boostPad.right > MAX_X) boostPad.right = MAX_X

    // Make sure the bottom few boost pads don't block the space directly above
    // the first/initial boost pad.
    if (y >= 0) {
      if (
        (firstPad.left < boostPad.right && boostPad.right < firstPad.right) ||
        (firstPad.left < boostPad.x && boostPad.x < firstPad.right)
      ) {
        boostPad.right = firstPad.left
      } else if (
        (firstPad.left < boostPad.left && boostPad.left < firstPad.right) ||
        (firstPad.left < boostPad.x && boostPad.x < firstPad.right)
      ) {
        boostPad.left = firstPad.right
      }
    }

    return boostPad
  }

  createCoin (y = 0) {
    const app = this._app
    const goals = app.rules['cny2023-goals']

    const BUFFER = TILE_SIZE * 4
    const MIN_X = 0 + BUFFER
    const MAX_X = app.canvasWidth - BUFFER
    const x = Math.random() * (MAX_X - MIN_X) + MIN_X

    app.addEntity(new Coin(app, x, y))
    goals.maxScore++
  }

  registerCNY2023Score (score) {
    const highscore = this.cny2023HighScores[this.current]

    if (highscore === undefined || highscore < score) {
      this.cny2023HighScores[this.current] = score
    }

    this.saveCNY2023HighScores()
  }

  saveCNY2023HighScores () {
    const storage = window?.localStorage
    if (!storage) return
    storage.setItem(CNY2023_HIGHSCORE_STORAGE_KEY, JSON.stringify(this.cny2023HighScores))
  }

  loadCNY2023HighScores () {
    const storage = window?.localStorage
    if (!storage) return
    try {
      const str = storage.getItem(CNY2023_HIGHSCORE_STORAGE_KEY)
      this.cny2023HighScores = (str) ? JSON.parse(str) : []
    } catch (err) {
      this.cny2023HighScores = []
      console.error(err)
    }
  }
}
