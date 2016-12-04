const c3 = window.c3
const req = window.superagent

class Configure {
  static set size (v) {
    this._dataArray = []
    for (let i = v; i--;) {
      this._dataArray.push(0)
    }
  }

  static get dataArray () {
    return this._dataArray.concat()
  }
}

class Watcher {
  constructor ({ size, wait, tasks, totalCPU, totalMemory, CPUGraph, memoryGraph, initialData, names, realNames, min }) {
    this.conf = {
      tasks,
      totalCPU,
      totalMemory,
      CPUGraph,
      memoryGraph,
      initialData,
      names,
      realNames,
      min
    }

    Configure.wait = wait
    Configure.size = size
    Configure.min = min
    Configure.keyMap = {}
    realNames.forEach((n, i) => {
      Configure.keyMap[n] = i
    })

    this.store = new DataStore()
  }

  start () {
    this.initialize()
  }

  initialize () {
    let { keyMap } = Configure

    this.timeList = []

    this.conf.initialData.forEach(({ time, processes, rowPositions }, i) => {
      console.log(rowPositions)
      this.timeList.push(time * 1000 + '')

      if (!processes) {
        return {}
      }
      processes.forEach((process) => {
        let pid = process[rowPositions.PID]
        let cmd = process[rowPositions.COMMAND]
        if (cmd.indexOf('/top') != -1 || cmd === 'top') {
          return
        }

        this.store.process(pid, cmd).addInto(process, i)
      })
    })


    this.cpuChart = new Chart({
      id: this.conf.CPUGraph,
      dataList: this.store.column('PerCPU'),
      timeList: this.timeList.concat()
    })

    this.memoryChart = new Chart({
      id: this.conf.memoryGraph,
      dataList: this.store.column('PerMemory'),
      timeList: this.timeList.concat()
    }).stack()
    this.work()
  }

  work () {
    setInterval(() => {
      req
        .get('/r')
        .set('Accept', 'application/json')
        .end((err, res) => {
          let { processes, rowPositions } = res.body

          setTimeout(()=> {
            this.cpuChart.add(processes, rowPositions.PID, rowPositions.COMMAND, rowPositions['%CPU'])
            this.cpuChart.shiftTime(this.timeList.concat())
          }, 1)
          setTimeout(()=> {
            this.memoryChart.add(processes, rowPositions.PID, rowPositions.COMMAND, rowPositions['%MEM'])
            this.memoryChart.shiftTime(this.timeList.concat())
          }, 2)
        })
    }, Configure.wait * 1000)
  }
}

class DataStore {
  constructor () {
    this.store = {}
  }

  column (name) {
    let re = []
    for (let i in this.store) {
      re.push([`${this.store[i].pid}:${this.store[i].cmd}`].concat(this.store[i].getByName(name)))
    }
    return re
  }

  process (pid, cmd) {
    if (this.store[pid]) {
      return this.store[pid]
    }

    return this.store[pid] = new DataSet({ pid, cmd })
  }

  add (processes) {
    let { keyMap } = Configure

    processes.forEach((process) => {
      let pid = process[keyMap.PID]
      let cmd = process[keyMap.Command]
      if (cmd.indexOf('/top') != -1 || cmd === 'top') {
        return
      }

      this.process(pid, cmd).add(process)
    })
  }
}

class DataSet {
  constructor ({ pid, cmd }) {
    this.pid = pid
    this.cmd = cmd
    this.store = []
    this.total = 0

    // 持ちうる key の分だけ配列を用意する
    for (let i in Configure.keyMap) {
      this.store.push(Configure.dataArray)
    }
  }

  getByName (name) {
    return this.store[Configure.keyMap[name]]
  }

  add (process) {
    process.forEach((v, i) => {
      this.store[i].shift()
      this.store[i].push(v)
    })
  }

  // プロセスの各値が入った配列が引数となるので、
  // それを y 軸上に配置する
  addInto (process, position) {
    process.forEach((v, i) => {
      let n = +v
      if (n < Configure.min) {
        n = 0
      }
      this.store[i][position] = n
      if (!isNaN(n)) {
        this.total += n
      }
    })
  }
}


class Chart {
  constructor ({ id, dataList, timeList }) {
    let columns = dataList
    timeList.unshift('x')
    // columns.push(timeList)

    this.chart = c3.generate({
      bindto: `#${id}`,
      size: {
        height: 800
      },
      data: {
        columns
      },
      legend: {
        show: false
      },
      tooltip: {
        grouped: false
      },
      axis: {
        x: {
          show: false
        },
        y: {
          max: 100,
          tick: {
            format: function (d) {
              if (d > 100) {
                return ''
              }
              return d + ' %';
            }
          }
        },
      },
      point: {
        show: false
      },
      transition: {
        duration: 0
      }
    });
  }

  shiftTime (timeList) {
    // this.chart.x(timeList)
  }

  add (processes, pidPosition, commandPosition, targetPosition) {
    let columns = []
    processes.forEach((process) => {
      let pid = process[pidPosition]
      let cmd = process[commandPosition]
      let value = process[targetPosition]
      if (cmd.indexOf('/top') != -1 || cmd === 'top') {
        return
      }

      let cols = this.chart.data.values(`${pid}:${cmd}`)
      if (cols) {
        cols.shift()
        cols.push(value)
        cols.unshift(`${pid}:${cmd}`)
        columns.push(cols)
      }
    })

    this.chart.load({ columns })
  }

  reload (dataList) {
    this.chart.load({
      columns: dataList
    })
  }

  stack () {
    this.chart.groups([this.chart.data().map((d) => d.id)])

    return this
  }
}

window.Watcher = Watcher

let d = new Date()
d.getHours()