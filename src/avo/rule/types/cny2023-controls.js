import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP } from '@avo/constants'

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

  paint (layer = 0) {}

  checkUserInput (timeStep) {
    const app = this._app
    const hero = app.hero
    const keysPressed = app.playerInput.keysPressed
    const TIME_MODIFIER = timeStep / EXPECTED_TIMESTEP

    if (!hero) return

    if (keysPressed['ArrowLeft']) {
      hero.pushX -= SIDE_SPEED / TIME_MODIFIER
    }

    if (keysPressed['ArrowRight']) {
      hero.pushX += SIDE_SPEED / TIME_MODIFIER
    }
  }
}
