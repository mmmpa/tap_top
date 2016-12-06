import ChartRow from './chat-row'

export default class ChartData {
  constructor (raw, size, isStack = false) {
    this.data = {}
    this.size = size
    this.total = 0
    this.stack = []
    this.isStack = isStack

    for (let k in raw) {
      let row = new ChartRow(raw[k])
      if (row.total !== 0) {
        this.data[k] = row
      }
    }

    if (!this.isStack) {
      return
    }

    for (let k in this.data) {
      this.data[k].prepareStack()
    }

    for (let i = size; i--;) {
      let pre = 0
      for (let k in this.data) {
        let now = this.data[k]
        now.setInStack(i, pre + now.data[i])
        pre = now.stack[i]
      }
    }
  }

  removeRow (row) {
    delete this.data[row.id]
  }

  add (newData) {
    let pre = 0

    // 既存の row に反映
    for (let k in this.data) {
      let row = this.data[k]

      let next
      if (newData[row.id]) {
        next = newData[row.id].value
        delete newData[row.id]
      } else {
        next = 0
      }
      pre += next
      row.shiftAndPush(next, pre)

      row.removable && this.removeRow(row)
    }

    // 新しい row を追加
    for (let i in newData) {
      let { id, name, value } = newData[i]
      let data = []
      for (let i = this.size - 1; i--;) {
        data[i] = 0
      }
      data.push(value)

      let row = new ChartRow({ id, name, data })

      if (this.isStack) {
        let previousLine
        for (let ii = id; ii--;) {
          if (this.data[ii]) {
            previousLine = this.data[ii]
            break
          }
        }

        row.copyStackFrom(previousLine)
        row.stack[data.length - 1] += value
      }

      this.data[id] = row
    }
  }
}

