import {
  TILE_SIZE,
  PLAYER_ACTIONS,
  MIN_LAYER, MAX_LAYER,
} from '@avo/constants'
import Physics from '@avo/physics'
import Levels from '@avo/levels'
import ImageAsset from '@avo/image-asset'
import JsonAsset from '@avo/json-asset'
import Interaction from '@avo/interaction'

const searchParams = new URLSearchParams(window.location.search)
const DEBUG = searchParams.get('debug') || false
const STARTING_LEVEL = (Number.isInteger(parseInt(searchParams.get('level'))))
  ? parseInt(searchParams.get('level')) - 1
  : 0

export default class AvO {
  constructor (args = {}) {
    const {
      width = 24 * TILE_SIZE,  // Canvas width
      height = 16 * TILE_SIZE,  // Canvas height
    } = args

    this.html = {
      main: document.getElementById('main'),
      canvas: document.getElementById('canvas'),
      homeMenu: document.getElementById('home-menu'),
      interactionMenu: document.getElementById('interaction-menu'),
      buttonHome: document.getElementById('button-home'),
      buttonFullscreen: document.getElementById('button-fullscreen'),
      buttonReload: document.getElementById('button-reload'),
    }

    this.homeMenu = false
    this.setHomeMenu(false)

    this.interactionMenu = false
    this.setInteractionMenu(false)

    this.canvas2d = this.html.canvas.getContext('2d')
    this.canvasWidth = width
    this.canvasHeight = height
    this._canvasHasCameraTransforms = false  // Safety check

    this.camera = {
      target: null,  // Target entity to follow. If null, camera is static.
      x: 0,
      y: 0,
      zoom: 1,
    }

    this.setupUI()

    this.initialised = false
    this.assets = {
      "hero-4dir": new ImageAsset('assets/avo-sprites-2022-05-samiel.png'),
      "hero-2dir": new ImageAsset('assets/avo-sprites-2022-10-samiel-2dir.png'),
      "exampleImage": new ImageAsset('assets/simple-bg.png'),
      // "exampleJson": new JsonAsset('assets/example.json'),
    }
    this.secretAssets = {
      // "secretImage": new ImageAsset('secrets/simple-bg.png'),
      // "secretJson": new JsonAsset('secrets/example.json'),
    }

    this.hero = null
    this.entities = []
    this.rules = {}
    this.levels = new Levels(this)

    this.playerAction = PLAYER_ACTIONS.IDLE
    this.playerInput = {
      // Mouse/touchscreen input
      pointerStart: undefined,
      pointerCurrent: undefined,
      pointerEnd: undefined,

      // Keys that are currently being pressed.
      // keysPressed = { key: { duration, acknowledged } }
      keysPressed: {},
    }

    this.prevTime = null
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }

  initialisationCheck () {
    // Assets check
    let allAssetsReady = true
    let numReadyAssets = 0
    let numTotalAssets = 0
    Object.keys(this.assets).forEach((id) => {
      const asset = this.assets[id]
      allAssetsReady = allAssetsReady && asset.ready
      if (asset.ready) numReadyAssets++
      numTotalAssets++
    })
    Object.keys(this.secretAssets).forEach((id) => {
      const secretAsset = this.secretAssets[id]
      const secretAssetIsReady = secretAsset.ready || secretAsset.error
      allAssetsReady = allAssetsReady && secretAssetIsReady
      if (secretAssetIsReady) numReadyAssets++
      numTotalAssets++
    })

    // Paint status
    this.canvas2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvas2d.textAlign = 'start'
    this.canvas2d.textBaseline = 'top'
    this.canvas2d.fillStyle = '#ccc'
    this.canvas2d.font = `1em monospace`
    this.canvas2d.fillText(`Loading ${numReadyAssets} / ${numTotalAssets} `, TILE_SIZE, TILE_SIZE)

    if (allAssetsReady) {
      // Clean up secret assets
      Object.keys(this.secretAssets).forEach((id) => {
        if (this.secretAssets[id].error) delete this.secretAssets[id]
      })

      // Let's go!
      this.initialised = true
      this.showUI()
      this.levels.load(STARTING_LEVEL)
    }
  }

  /*
  Section: General Logic
  ----------------------------------------------------------------------------
   */

  /*
  The main loop. Run a single frame of gameplay.
  - time: the current/total time (milliseconds) since the game started.
   */
  main (time) {
    const timeStep = (this.prevTime) ? time - this.prevTime : time
    this.prevTime = time

    if (this.initialised) {
      this.play(timeStep)
      this.paint()
    } else {
      this.initialisationCheck()
    }

    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }

  /*
  Run the gameplay/physics logic for a single frame.
  - timeStep: the time (milliseconds) since the last frame.
    We expect 60 frames per second.
   */
  play (timeStep) {
    // If a menu is open, pause all action gameplay
    if (this.homeMenu || this.interactionMenu) return

    // Run the action gameplay
    // ----------------
    for (const id in this.rules) { this.rules[id].play(timeStep) }

    this.entities.forEach(entity => entity.play(timeStep))
    this.checkCollisions(timeStep)

    // Cleanup
    this.entities = this.entities.filter(entity => !entity._expired)
    for (const id in this.rules) {
      if (this.rules[id]._expired) delete this.rules[id]
    }

    // Sort Entities along the y-axis, for paint()/rendering purposes.
    // WARNING: inefficient
    this.entities.sort((a, b) => a.y - b.y)
    // ----------------

    // Increment the duration of each currently pressed key
    Object.keys(this.playerInput.keysPressed).forEach(key => {
      if (this.playerInput.keysPressed[key]) this.playerInput.keysPressed[key].duration += timeStep
    })
  }

  /*
  Paint/draw the game visuals onto the canvas.
   */
  paint () {
    const c2d = this.canvas2d
    const camera = this.camera

    // Camera Controls: focus the camera on the target entity, if any.
    // ----------------
    if (camera.target) {
      camera.x = this.canvasWidth / 2 - camera.target.x * camera.zoom
      camera.y = this.canvasHeight / 2 - camera.target.y * camera.zoom
    }

    c2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    c2d.resetTransform()

    c2d.strokeStyle = 'rgba(128, 128, 128, 0.05)'
    c2d.lineWidth = 2
    // ----------------

    // Draw grid
    // ----------------
    const GRID_SIZE = TILE_SIZE * camera.zoom
    const offsetX = (this.camera.x % GRID_SIZE) - GRID_SIZE
    const offsetY = (this.camera.y % GRID_SIZE) - GRID_SIZE

    for (let y = offsetY ; y < this.canvasHeight ; y += GRID_SIZE) {
      for (let x = offsetX ; x < this.canvasWidth ; x += GRID_SIZE) {
        c2d.beginPath()
        c2d.rect(x, y, GRID_SIZE, GRID_SIZE)
        c2d.stroke()

        // Debug Grid
        if (DEBUG) {
          c2d.fillStyle = '#ccc'
          c2d.font = `${camera.zoom * 0.5}em Source Code Pro`
          c2d.textAlign = 'center'
          c2d.textBaseline = 'middle'
          const col = Math.floor((x - this.camera.x) / GRID_SIZE)
          const row = Math.floor((y - this.camera.y) / GRID_SIZE)
          c2d.fillText(col + ',' + row, x + GRID_SIZE / 2, y + GRID_SIZE / 2)  // using template strings here messes up colours in Brackets.
        }
      }
    }
    // ----------------

    // Draw entities and other elements
    // ----------------
    for (let layer = MIN_LAYER ; layer <= MAX_LAYER ; layer++) {
      this.entities.forEach(entity => entity.paint(layer))
      for (const id in this.rules) { this.rules[id].paint(layer) }
    }
    // ----------------

    // Draw player input
    // ----------------
    if (
      this.playerAction === PLAYER_ACTIONS.POINTER_DOWN
      && this.hero
      && this.playerInput.pointerCurrent
    ) {

      const inputCoords = this.playerInput.pointerCurrent

      c2d.strokeStyle = '#888'
      c2d.lineWidth = TILE_SIZE / 8

      c2d.beginPath()
      c2d.arc(inputCoords.x, inputCoords.y, TILE_SIZE, 0, 2 * Math.PI)
      c2d.stroke()
    }
    // ----------------
  }

  /*
  Section: UI and Event Handling
  ----------------------------------------------------------------------------
   */

  setupUI () {
    this.html.canvas.width = this.canvasWidth
    this.html.canvas.height = this.canvasHeight
    this.canvas2d.imageSmoothingEnabled = false  /* Pixel art: Maintains sprites' pixel sharpness when scaled up via drawImage() */

    if (window.PointerEvent) {
      this.html.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this))
      this.html.canvas.addEventListener('pointermove', this.onPointerMove.bind(this))
      this.html.canvas.addEventListener('pointerup', this.onPointerUp.bind(this))
      this.html.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this))
    } else {
      this.html.canvas.addEventListener('mousedown', this.onPointerDown.bind(this))
      this.html.canvas.addEventListener('mousemove', this.onPointerMove.bind(this))
      this.html.canvas.addEventListener('mouseup', this.onPointerUp.bind(this))
    }

    // Prevent "touch and hold to open context menu" menu on touchscreens.
    this.html.canvas.addEventListener('touchstart', stopEvent)
    this.html.canvas.addEventListener('touchmove', stopEvent)
    this.html.canvas.addEventListener('touchend', stopEvent)
    this.html.canvas.addEventListener('touchcancel', stopEvent)

    this.html.buttonHome.addEventListener('click', this.buttonHome_onClick.bind(this))
    this.html.buttonFullscreen.addEventListener('click', this.buttonFullscreen_onClick.bind(this))
    this.html.buttonReload.addEventListener('click', this.buttonReload_onClick.bind(this))

    this.html.main.addEventListener('keydown', this.onKeyDown.bind(this))
    this.html.main.addEventListener('keyup', this.onKeyUp.bind(this))

    window.addEventListener('resize', this.updateUI.bind(this))
    this.updateUI()
    this.hideUI()  // Hide until all assets are ready

    this.html.main.focus()
  }

  hideUI () {
    this.html.buttonHome.style.visibility = 'hidden'
    this.html.buttonReload.style.visibility = 'hidden'
  }

  showUI () {
    this.html.buttonHome.style.visibility = 'visible'
    this.html.buttonReload.style.visibility = 'visible'
  }

  updateUI () {
    // Fit the interaction layers (menus, etc) to the canvas
    const mainDivBounds = this.html.main.getBoundingClientRect()
    const canvasBounds = this.html.canvas.getBoundingClientRect()

    this.html.homeMenu.style.width = `${canvasBounds.width}px`
    this.html.homeMenu.style.height = `${canvasBounds.height}px`
    this.html.homeMenu.style.top = `${canvasBounds.top - mainDivBounds.top}px`
    this.html.homeMenu.style.left = `${canvasBounds.left}px`

    this.html.interactionMenu.style.width = `${canvasBounds.width}px`
    this.html.interactionMenu.style.height = `${canvasBounds.height}px`
    this.html.interactionMenu.style.top = `${canvasBounds.top - mainDivBounds.top}px`
    this.html.interactionMenu.style.left = `${canvasBounds.left}px`
  }

  setHomeMenu (homeMenu) {
    this.homeMenu = homeMenu
    if (homeMenu) {
      this.html.homeMenu.style.visibility = 'visible'
      this.html.buttonReload.style.visibility = 'hidden'
    } else {
      this.html.homeMenu.style.visibility = 'hidden'
      this.html.buttonReload.style.visibility = 'visible'
      this.html.main.focus()
    }
  }

  setInteractionMenu (interactionMenu) {
    const div = this.html.interactionMenu

    this.interactionMenu && this.interactionMenu.unload()  // Unload the old menu, if any
    this.interactionMenu = interactionMenu  // Set the new menu

    if (interactionMenu) {
      while (div.firstChild) { div.removeChild(div.firstChild) }  // Clear div
      interactionMenu.load(div)  // load the new menu
      div.style.visibility = 'visible'
    } else {
      div.style.visibility = 'hidden'
      this.html.main.focus()
    }
  }

  onPointerDown (e) {
    const coords = getEventCoords(e, this.html.canvas)

    this.playerAction = PLAYER_ACTIONS.POINTER_DOWN
    this.playerInput.pointerStart = coords
    this.playerInput.pointerCurrent = coords
    this.playerInput.pointerEnd = undefined

    this.html.main.focus()

    return stopEvent(e)
  }

  onPointerMove (e) {
    const coords = getEventCoords(e, this.html.canvas)
    this.playerInput.pointerCurrent = coords

    return stopEvent(e)
  }

  onPointerUp (e) {
    const coords = getEventCoords(e, this.html.canvas)

    if (this.playerAction === PLAYER_ACTIONS.POINTER_DOWN) {
      this.playerInput.pointerEnd = coords
      this.playerAction = PLAYER_ACTIONS.IDLE
    }

    return stopEvent(e)
  }

  onKeyDown (e) {
    // Special cases
    switch (e.key) {
      // Open home menu
      case 'Escape':
        this.setHomeMenu(!this.homeMenu)
        break

      // DEBUG
      case 'z':
        if (!this.interactionMenu) {
          this.setInteractionMenu(new Interaction(this))
        }
        break

      // DEBUG
      case 'c':
        if (this.hero?.spriteStyle === 'toon') {
          this.hero.spriteStyle = 'zelda'
        } else if (this.hero?.spriteStyle === 'zelda') {
          this.hero.spriteStyle = 'toon'
        }
        break

      case '-':
      case '_':
        this.camera.zoom = Math.max(0.5, this.camera.zoom - 0.5)
        break

      case '+':
      case '=':
        this.camera.zoom = Math.min(4, this.camera.zoom + 0.5)
        break
    }

    // General input
    if (!this.playerInput.keysPressed[e.key]) {
      this.playerInput.keysPressed[e.key] = {
        duration: 0,
        acknowledged: false,
      }
    }
  }

  onKeyUp (e) {
    this.playerInput.keysPressed[e.key] = undefined
  }

  buttonHome_onClick () {
    this.setHomeMenu(!this.homeMenu)
  }

  buttonFullscreen_onClick () {
    const isFullscreen = document.fullscreenElement
    if (!isFullscreen) {
      if (this.html.main.requestFullscreen) {
        this.html.main.className = 'fullscreen'
        this.html.main.requestFullscreen()
      }
    } else {
      document.exitFullscreen?.()
      this.html.main.className = ''
    }
    this.updateUI()
  }

  buttonReload_onClick () {
    this.levels.reload()
  }

  /*
  Section: Gameplay
  ----------------------------------------------------------------------------
   */

  addEntity (entity) {
    if (!entity) return null
    if (!this.entities.includes(entity)) this.entities.push(entity)
    return entity
  }

  removeEntity (entityOrMatchingFn) {
    if (!entityOrMatchingFn) return
    if (typeof entityOrMatchingFn === 'function') {
      this.entities.filter(entityOrMatchingFn).forEach(entity => {
        entity._expired = true
      })
    } else if (this.entities.includes(entityOrMatchingFn)) {
      entityOrMatchingFn._expired = true
    }
  }

  addRule (rule) {
    if (!rule) return
    const id = rule._type
    this.rules[id] = rule
  }

  clearRules () {
    for (const id in this.rules) { delete this.rules[id] }
  }

  /*
  Section: Painting
  ----------------------------------------------------------------------------
   */

  /*
  Applies camera transforms to the canvas.
  Should be run right before drawing an Entity (or etc) so the object is drawn
  relative to the camera's view.
   */
  applyCameraTransforms () {
    if (this._canvasHasCameraTransforms) throw new Error('Canvas already has camera transforms.')
    this._canvasHasCameraTransforms = true
    const c2d = this.canvas2d
    const camera = this.camera
    c2d.save()
    c2d.translate(camera.x, camera.y)
    c2d.scale(camera.zoom, camera.zoom)
  }

  /*
  Removes camera transforms from the canvas.
   */
  undoCameraTransforms () {
    if (!this._canvasHasCameraTransforms) throw new Error('Canvas doesn\'t have camera transforms.')
    this._canvasHasCameraTransforms = false
    this.canvas2d.restore()
  }

  /*
  Section: Misc
  ----------------------------------------------------------------------------
   */

  checkCollisions (timeStep) {
    for (let a = 0 ; a < this.entities.length ; a++) {
      let entityA = this.entities[a]

      for (let b = a + 1 ; b < this.entities.length ; b++) {
        let entityB = this.entities[b]
        let collisionCorrection = Physics.checkCollision(entityA, entityB)

        if (collisionCorrection) {
          entityA.onCollision(entityB, collisionCorrection.a)
          entityB.onCollision(entityA, collisionCorrection.b)
        }
      }
    }
  }
}

function getEventCoords (event, element) {
  const xRatio = (element.width && element.offsetWidth) ? element.width / element.offsetWidth : 1
  const yRatio = (element.height && element.offsetHeight) ? element.height / element.offsetHeight : 1

  const x = event.offsetX * xRatio
  const y = event.offsetY * yRatio
  return { x, y }
}

function stopEvent (e) {
  if (!e) return false
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
  e.returnValue = false
  e.cancelBubble = true
  return false
}
