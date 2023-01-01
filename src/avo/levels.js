import {
  PLAYER_ACTIONS, DIRECTIONS,
  CNY2023_COLS, CNY2023_ROWS,
  TILE_SIZE
} from '@avo/constants'

import Rabbit from '@avo/entity/types/rabbit'
import Wall from '@avo/entity/types/wall'
import BouncePad from '@avo/entity/types/bounce-pad'

import CNY2023Controls from '@avo/rule/types/cny2023-controls'

const MIN_X = 0
const MAX_X = CNY2023_ROWS * TILE_SIZE

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

    // app.addEntity(new Wall(app, 0, 0, 1, 16))  // West Wall
    // app.addEntity(new Wall(app, 23, 0, 1, 16))  // East Wall
    // app.addEntity(new Wall(app, 1, 0, 22, 1))  // North Wall
    app.addEntity(new Wall(app, 0, CNY2023_ROWS - 1, CNY2023_COLS, 1))  // South Wall

    const bouncePadWidth = 10
    app.addEntity(new BouncePad(app, (CNY2023_COLS - bouncePadWidth) / 2, CNY2023_ROWS - 2, bouncePadWidth, 1))  // Bouncepad

    for (let y = TILE_SIZE * 4 ; y > -1000 ; y -= (TILE_SIZE* 8)) {
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

    app.addEntity(new BouncePad(app, col, row, width, height))
  }
}
