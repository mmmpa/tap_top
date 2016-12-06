import { numToColor } from '../utils/color-wheel'

export default class ChartRow {
  constructor ({ id, name, data, color }) {
    this.id = id
    this.name = name || ''
    this.data = data || []
    this.stack = []
    this.total = this.data.reduce((a, n) => a + Math.floor(n * 10), 0)

    this.color = color || numToColor(this.id)
  }

  copyStackFrom (previousLine) {
    this.stack = (previousLine ? previousLine.stack : this.data).map((d) => d)
  }

  shiftAndPush (value, stackValue) {

    let remove = this.data.shift()
    this.total += (Math.floor(value * 10) - Math.floor(remove * 10))
    this.data.push(value)

    this.stack.shift()
    this.stack.push(stackValue)
  }

  get removable () {
    return this.total <= 0
  }

  prepareStack () {
    this.stack = this.data.concat()
  }

  setInStack (i, v) {
    this.stack[i] = v
  }
}