import {
  PLAYER_ACTIONS, DIRECTIONS,
  CNY2023_COLS, CNY2023_ROWS,
  TILE_SIZE
} from '@avo/constants'

import Rabbit from '@avo/entity/types/cny2023/rabbit'
import Ground from '@avo/entity/types/cny2023/ground'
import BoostPad from '@avo/entity/types/cny2023/boost-pad'

import CNY2023Controls from '@avo/rule/types/cny2023-controls'
import CNY2023Goals from '@avo/rule/types/cny2023-goals'

const MIN_X = 0
const MAX_X = CNY2023_ROWS * TILE_SIZE
const ROWS_BETWEEN_BOOSTSPADS = 8

export const CNY2023_CEILING_Y = -100 * TILE_SIZE
export const CNY2023_FLOOR_Y = CNY2023_ROWS * TILE_SIZE

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 0
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

    app.hero = app.addEntity(new Rabbit(app, (CNY2023_COLS-1) / 2, 1))
    app.camera.x = 0
    app.camera.y = 0
    //app.camera.target = app.hero

    app.addRule(new CNY2023Controls(app))
    app.addRule(new CNY2023Goals(app))

    // app.addEntity(new Wall(app, 0, 0, 1, 16))  // West Wall
    // app.addEntity(new Wall(app, 23, 0, 1, 16))  // East Wall
    // app.addEntity(new Wall(app, 1, 0, 22, 1))  // North Wall
    // app.addEntity(new Wall(app, 0, CNY2023_ROWS - 1, CNY2023_COLS, 1))  // South Wall
    app.addEntity(new Ground(app, 0, CNY2023_ROWS - 1, CNY2023_COLS, 1))  // South Wall

    const boostPadWidth = 10
    app.addEntity(new BoostPad(app, (CNY2023_COLS - boostPadWidth) / 2, CNY2023_ROWS - 2, boostPadWidth, 1))  // Boostpad

    for (let y = TILE_SIZE * 4 ; y >= CNY2023_CEILING_Y ; y -= (TILE_SIZE * ROWS_BETWEEN_BOOSTSPADS)) {
      this.createBoucePad(y)
      console.log(y)
    }
  }

  createBoucePad (y = 0) {
    const app = this._app

    const width = Math.random() * 8 + 2
    const height = 1
    const x = Math.random() * (MAX_X - MIN_X - width)
    const row = y / TILE_SIZE
    const col = x / TILE_SIZE

    app.addEntity(new BoostPad(app, col, row, width, height))
  }
}
