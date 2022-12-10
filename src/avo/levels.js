import { PLAYER_ACTIONS, DIRECTIONS } from '@avo/constants'

import Hero from '@avo/entity/types/hero'
import Wall from '@avo/entity/types/wall'
import Ball from '@avo/entity/types/ball'
import Enemy from '@avo/entity/types/enemy'

import ZeldaControls from '@avo/rule/types/zelda-controls'
import CNY2022Controls from '@avo/rule/types/cny2022-controls'

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
    this.generate_zelda_default()
  }

  reload () {
    this.load(this.current)
  }

  /*
  Default top-down adventure level.
   */
  generate_zelda_default () {
    const app = this._app

    app.hero = app.addEntity(new Hero(app, 11, 1))
    app.camera.target = app.hero

    app.addRule(new ZeldaControls(app))

    app.addEntity(new Wall(app, 0, 0, 1, 23))  // West Wall
    app.addEntity(new Wall(app, 22, 0, 1, 23))  // East Wall
    app.addEntity(new Wall(app, 1, 0, 21, 1))  // North Wall
    app.addEntity(new Wall(app, 1, 22, 21, 1))  // South Wall
    app.addEntity(new Wall(app, 3, 2, 3, 1))
    app.addEntity(new Wall(app, 3, 4, 3, 1))

    app.addEntity(new Ball(app, 8, 6))

    const enemy = app.addEntity(new Enemy(app, 4, 8))
    enemy.rotation = -45 / 180 * Math.PI
  }
}
