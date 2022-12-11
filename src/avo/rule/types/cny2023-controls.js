import Rule from '@avo/rule'
import { EXPECTED_TIMESTEP } from '@avo/constants'

const GRAVITY = 0.7

export default class CNY2023Controls extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2023-controls'
  }

  play (timeStep) {
    const app = this._app
    const entities = app.entities
    const TIME_MODIFIER = timeStep / EXPECTED_TIMESTEP

    entities.forEach(entity => {
      if (entity.movable) {
        entity.pushY += GRAVITY / TIME_MODIFIER
      }
    })


  }

  paint (layer = 0) {}
}
