import Rule from '@avo/rule'
import {
  DIRECTIONS, EXPECTED_TIMESTEP, LAYERS, TILE_SIZE,
  CNY2023_GRAVITY, CNY2023_RABBIT_SPEED,
  CNY2023_COLS, CNY2023_ROWS
} from '@avo/constants'

const MIN_X = 0
const MAX_X = CNY2023_COLS * TILE_SIZE
const MIN_RABBIT_X = MIN_X + TILE_SIZE
const MAX_RABBIT_X = MAX_X - TILE_SIZE
const MAX_Y = CNY2023_ROWS * TILE_SIZE

/*
This Rule handles most of the moment-to-moment gameplay.
 */
export default class CNY2023Controls extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2023-controls'

    this.stars = this.generateStars()
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
    this.checkRabbitPosition()
    this.focusCamera()
  }

  paint (layer = 0) {
    const app = this._app
    const hero = app.hero
    const camera = app.camera
    const c2d = app.canvas2d

    if (layer === LAYERS.BACKGROUND) {
      // Paint sky
      // ----------------
      const gradient = c2d.createLinearGradient(0, 0, 0, app.canvasHeight)
      gradient.addColorStop(0, '#404040')
      gradient.addColorStop(1, '#6080a0')

      c2d.fillStyle = gradient
      c2d.fillRect(0, 0, app.canvasWidth, app.canvasHeight)
      // ----------------

      // Paint stars
      c2d.fillStyle = '#fff'
      this.stars.forEach(star => {
        c2d.beginPath()
        c2d.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI)
        c2d.closePath()
        c2d.fill()
      })
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
      hero.direction = DIRECTIONS.WEST
    }

    if (keysPressed['ArrowRight'] || buttonArrowRightPressed) {
      hero.pushX += CNY2023_RABBIT_SPEED / TIME_MODIFIER
      hero.direction = DIRECTIONS.EAST
    }

    // DEBUG
    // TODO: remove
    const goals = app.rules['cny2023-goals']
    if (keysPressed['(']) {
      goals.triggerWinScreen()
    } else if (keysPressed[')']) {
      goals.triggerLoseScreen()
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

  checkRabbitPosition () {
    const app = this._app
    const hero = app.hero
    const goals = app.rules['cny2023-goals']
    if (!hero || !goals) return

    hero.x = Math.max(hero.x, MIN_RABBIT_X)
    hero.x = Math.min(hero.x, MAX_RABBIT_X)

    if (hero.y > MAX_Y) goals.triggerLoseScreen()
  }

  generateStars () {
    const stars = []
    const app = this._app
    for (let i = 0; i < 100 ; i++) {
      const x = Math.random() * app.canvasWidth
      const y = (Math.random() * Math.random()) * app.canvasHeight
      const size = 2
      stars.push({ x, y, size })
    }
    return stars
  }
}
