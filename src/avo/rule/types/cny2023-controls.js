import Rule from '@avo/rule'
import {
  EXPECTED_TIMESTEP, LAYERS, TILE_SIZE,
  CNY2023_GRAVITY, CNY2023_RABBIT_SPEED,
  CNY2023_COLS
} from '@avo/constants'

const MIN_X = 0
const MAX_X = CNY2023_COLS * TILE_SIZE
const MIN_RABBIT_X = MIN_X + TILE_SIZE
const MAX_RABBIT_X = MAX_X - TILE_SIZE

export default class CNY2023Controls extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2023-controls'
  }

  play (timeStep) {
    const app = this._app
    const entities = app.entities
    const TIME_MODIFIER = timeStep / EXPECTED_TIMESTEP

    // Gravity
    entities.forEach(entity => {
      if (entity.movable) {
        entity.pushY += CNY2023_GRAVITY / TIME_MODIFIER
      }
    })

    this.checkUserInput(timeStep)
    this.constrainRabbitPosition()
    this.focusCamera()
  }

  paint (layer = 0) {
    const app = this._app
    const hero = app.hero
    const c2d = app.canvas2d

    if (layer === LAYERS.HUD) {
      // Draw UI data
      // ----------------
      const X_OFFSET = TILE_SIZE * 1.5
      const Y_OFFSET = TILE_SIZE * -1.0
      const LEFT = X_OFFSET
      const RIGHT = app.canvasWidth - X_OFFSET
      const BOTTOM = app.canvasHeight + Y_OFFSET
      c2d.font = '2em Source Code Pro'
      c2d.textBaseline = 'bottom'
      c2d.lineWidth = 8

      let text = `pushY: ${hero?.pushY.toFixed(2)}`
      c2d.textAlign = 'right'
      c2d.strokeStyle = '#fff'
      c2d.strokeText(text, RIGHT, BOTTOM)
      c2d.fillStyle = '#c44'
      c2d.fillText(text, RIGHT, BOTTOM)
      // ----------------

    }
  }

  checkUserInput (timeStep) {
    const app = this._app
    const hero = app.hero
    const {
      keysPressed,
      buttonArrowLeftPressed,
      buttonArrowRightPressed,
    } = app.playerInput
    const TIME_MODIFIER = timeStep / EXPECTED_TIMESTEP

    if (!hero) return

    if (keysPressed['ArrowLeft'] || buttonArrowLeftPressed) {
      hero.pushX -= CNY2023_RABBIT_SPEED / TIME_MODIFIER
    }

    if (keysPressed['ArrowRight'] || buttonArrowRightPressed) {
      hero.pushX += CNY2023_RABBIT_SPEED / TIME_MODIFIER
    }
  }

  focusCamera () {
    const app = this._app
    const hero = app.hero
    const camera = app.camera

    if (hero) {
      camera.x =  (camera.zoom <= 1)
        ? app.canvasWidth / 2 - (app.canvasWidth / 2) * camera.zoom
        : app.canvasWidth / 2 - hero.x * camera.zoom
      camera.y = app.canvasHeight / 2 - hero.y * camera.zoom

      // Clamp to viewable space
      camera.y = Math.max(camera.y, 0)
    }
  }

  constrainRabbitPosition () {
    const hero = this._app.hero
    if (!hero) return

    hero.x = Math.max(hero.x, MIN_RABBIT_X)
    hero.x = Math.min(hero.x, MAX_RABBIT_X)
  }
}
