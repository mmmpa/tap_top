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
  constructor ({ size, wait, tasks, totalCPU, totalMemory, CPUGraph, memoryGraph, initialData, names, realNames }) {
    this.conf = {
      tasks,
      totalCPU,
      totalMemory,
      CPUGraph,
      memoryGraph,
      initialData,
      names,
      realNames
    }

    Configure.wait = wait
    Configure.size = size
    Configure.keyMap = {}
    realNames.forEach((n, i) => {
      Configure.keyMap[n] = i
    })
  }

  start () {
    this.initialize()
  }

  initialize () {
    let { keyMap } = Configure

    let store = new DataStore()

    this.conf.initialData.forEach(({ processes }, i) => {
      if (!processes) {
        return {}
      }
      processes.forEach((process) => {
        let pid = process[keyMap.PID]
        let cmd = process[keyMap.Command]
        if (cmd.indexOf('/top') != -1 || cmd === 'top') {
          return
        }

        store.process(pid, cmd).addInto(process, i)
      })
    })

    new Chart({
      id: this.conf.CPUGraph,
      dataList: store.column('PerCPU')
    })
  }

  loop () {
    setInterval(function () {
      req
        .get('/r')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          console.log(res)
        })
    }, this.conf.wait * 1000)
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
}

class DataSet {
  constructor ({ pid, cmd }) {
    this.pid = pid
    this.cmd = cmd
    this.store = []
    for (let i in Configure.keyMap) {
      this.store.push(Configure.dataArray)
    }
  }

  getByName (name) {
    return this.store[Configure.keyMap[name]]
  }

  add (process) {
    process.forEach((v, i) => {
      this.store[i].push(v)
    })
  }

  addInto (process, position) {
    process.forEach((v, i) => {
      this.store[i][position] = v
    })
  }
}


class Chart {
  constructor ({ id, dataList }) {
    console.log(dataList)
    let columns = dataList
    for (let i in dataList) {
      columns.push(dataList[i])
    }

    this.chart = c3.generate({
      bindto: `#${id}`,
      size: {
        height: 800
      },
      data: {
        columns
      },
      axis: {
        x: {
          type: 'category',
          categories: [],
          tick: {
            rotate: 90,
            multiline: false
          },
          height: 100
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
}

window.Watcher = Watcher

