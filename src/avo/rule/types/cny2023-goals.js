import Rule from '@avo/rule'

/*
This Rule keeps track of scores and the win/lose condition.
 */
export default class CNY2023Goals extends Rule {
  constructor (app) {
    super(app)
    this._type = 'cny2023-goals'

    this.win = false
    this.lose = false

    this.score = 0
  }

  play (timeStep) {}

  paint (layer = 0) {}

  triggerWinScreen () {
    if (this.win || this.lose) return  // Don't trigger more than once
    this.win = true

    console.log('WIN')
  }

  triggerLoseScreen () {
    if (this.win || this.lose) return  // Don't trigger more than once
    this.lose = true

    console.log('LOSE')
  }
}
