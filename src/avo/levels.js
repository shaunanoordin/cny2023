import { PLAYER_ACTIONS, DIRECTIONS, TILE_SIZE } from '@avo/constants'

import Rabbit from '@avo/entity/types/rabbit'
import Wall from '@avo/entity/types/wall'
import BouncePad from '@avo/entity/types/bounce-pad'

import CNY2023Controls from '@avo/rule/types/cny2023-controls'

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

    app.hero = app.addEntity(new Rabbit(app, 11.5, 1))
    app.camera.x = 0
    app.camera.y = 0
    //app.camera.target = app.hero

    app.addRule(new CNY2023Controls(app))

    app.addEntity(new Wall(app, 0, 0, 1, 16))  // West Wall
    app.addEntity(new Wall(app, 23, 0, 1, 16))  // East Wall
    app.addEntity(new Wall(app, 1, 0, 22, 1))  // North Wall
    app.addEntity(new Wall(app, 1, 15, 22, 1))  // South Wall

    app.addEntity(new BouncePad(app, 10, 14, 4, 1))  // Bouncepad
  }
}
