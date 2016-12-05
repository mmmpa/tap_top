class ChartData {
  constructor(data) {
    let newData = data.sort((a, b) => a.id > b.id ? 1 : -1)

    if (!this.props.stack) {
      return newData
    }

    for (let i = Configure.size; i--;) {
      let pre = 0
      newData.forEach(({ data })=> {
        pre += data[i]
        data[i] = pre
      })
    }

    this.data = newData
  }
}