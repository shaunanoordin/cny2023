import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP, LAYERS, TILE_SIZE } from '@avo/constants'

const GRAVITY = 0.7
const SIDE_SPEED = 0.5

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
        entity.pushY += GRAVITY / TIME_MODIFIER
      }
    })

    this.checkUserInput(timeStep)
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
      hero.pushX -= SIDE_SPEED / TIME_MODIFIER
    }

    if (keysPressed['ArrowRight'] || buttonArrowRightPressed) {
      hero.pushX += SIDE_SPEED / TIME_MODIFIER
    }

    if (keysPressed['ArrowUp']) {
        hero.pushY = -20
    }
  }
}
