import Rule from '@avo/rule'
import {
  DIRECTIONS, EXPECTED_TIMESTEP, LAYERS, TILE_SIZE,
  CNY2023_GRAVITY, CNY2023_RABBIT_SPEED,
  CNY2023_COLS, CNY2023_ROWS,
  PLAYER_ACTIONS,
} from '@avo/constants'

const MIN_X = 0
const MAX_X = CNY2023_COLS * TILE_SIZE
const MIN_RABBIT_X = MIN_X + TILE_SIZE
const MAX_RABBIT_X = MAX_X - TILE_SIZE
const MAX_Y = CNY2023_ROWS * TILE_SIZE
const MIN_POINTER_MOVEMENT = TILE_SIZE / 2
const MAX_POINTER_MOVEMENT = TILE_SIZE * 8

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
    const timeCorrection = timeStep / EXPECTED_TIMESTEP

    // Gravity
    entities.forEach(entity => {
      if (entity.movable) {
        entity.pushY += CNY2023_GRAVITY * timeCorrection
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
      // ----------------
      c2d.fillStyle = '#fff'
      this.stars.forEach(star => {
        c2d.beginPath()
        c2d.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI)
        c2d.closePath()
        c2d.fill()
      })
      // ----------------

    } else if (layer === LAYERS.HUD) {
      if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
        const { pointerCurrent, pointerStart } = app.playerInput

        c2d.strokeStyle = '#c04040'
        c2d.lineWidth = 4

        c2d.beginPath()
        c2d.arc(pointerStart.x, pointerStart.y, MIN_POINTER_MOVEMENT, 0, 2 * Math.PI)
        c2d.closePath()
        c2d.stroke()

        let pointerDist = pointerCurrent.x - pointerStart.x
        if (pointerDist < 0) pointerDist = Math.max(pointerDist, -MAX_POINTER_MOVEMENT)
        if (pointerDist > 0) pointerDist = Math.min(pointerDist, MAX_POINTER_MOVEMENT)

        c2d.beginPath()
        c2d.moveTo(pointerStart.x, pointerStart.y)
        c2d.lineTo(pointerStart.x + pointerDist, pointerStart.y)
        c2d.closePath()
        c2d.stroke()
      }
    }
  }

  checkUserInput (timeStep) {
    const app = this._app
    const hero = app.hero
    const {
      keysPressed,
      buttonArrowLeftPressed,
      buttonArrowRightPressed,
      pointerCurrent,
      pointerStart,
    } = app.playerInput
    const timeCorrection = timeStep / EXPECTED_TIMESTEP
    let rabbitSpeed = CNY2023_RABBIT_SPEED * timeCorrection

    if (!hero) return

    let pointerMovementX = 0
    if (app.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      pointerMovementX = (pointerCurrent?.x || 0) - (pointerStart?.x || 0)
      const pointerDist = (Math.min(Math.max(Math.abs(pointerMovementX), MIN_POINTER_MOVEMENT), MAX_POINTER_MOVEMENT) - MIN_POINTER_MOVEMENT) / (MAX_POINTER_MOVEMENT - MIN_POINTER_MOVEMENT)
      const pointerSpeedModifier = 1 + 1 * pointerDist
      rabbitSpeed *= pointerSpeedModifier
    }

    if (keysPressed['ArrowLeft'] || buttonArrowLeftPressed || pointerMovementX < -MIN_POINTER_MOVEMENT) {
      hero.pushX -= rabbitSpeed
      hero.direction = DIRECTIONS.WEST
    }

    if (keysPressed['ArrowRight'] || buttonArrowRightPressed || pointerMovementX > MIN_POINTER_MOVEMENT) {
      hero.pushX += rabbitSpeed
      hero.direction = DIRECTIONS.EAST
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
