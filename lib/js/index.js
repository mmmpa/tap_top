const c3 = window.c3
const req = window.superagent

import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }
import ChartComponent from './components/chart'
import { EventEmitter } from 'events';

import hub from './utils/hub'

export class Configure {
  static set size (v) {
    this._dataArray = []
    for (let i = v; i--;) {
      this._dataArray.push(0)
    }
    this._size = v
  }

  static get size () {
    return this._size
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

    render(
      <ChartComponent
        name='PerCPU'
        data={ this.store.column('PerCPU') }
        xLabels={ this.timeList }
        conf={{
          w: 800,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 200,
          yLabelStep: 20,
          yLabelFormat: (v) => v + ' %',
          xLabelFormat: (v) => dateString(v)
        }}/>,
      document.querySelector(`#${this.conf.CPUGraph}`)
    )

    render(
      <ChartComponent
        name='PerMemory'
        stack={true}
        data={ this.store.column('PerMemory') }
        xLabels={ this.timeList }
        conf={{
          w: 800,
          h: 600,
          xLabelHeight: 70,
          xLabelRotate: 0,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 5,
          yLabelFormat: (v) => v + ' %',
          xLabelFormat: (v) => dateString(v)
        }}/>,
      document.querySelector(`#${this.conf.memoryGraph}`)
    )

    setInterval(() => {
      req
        .get('/r')
        .set('Accept', 'application/json')
        .end((err, res) => {
          let { processes, rowPositions, time } = res.body
          time *= 1000
          let picked = pick(processes, rowPositions.PID, rowPositions.COMMAND, [rowPositions['%CPU'], rowPositions['%MEM']])
          hub.emit('PerCPU', {
            type: 'add', data: picked[rowPositions['%CPU']],
            xLabel: time
          })
          hub.emit('PerMemory', {
            type: 'add', data: picked[rowPositions['%MEM']],
            xLabel: time
          })
        })
    }, Configure.wait * 1000)
  }
}

function dateString (unixTime) {
  let d = new Date(+unixTime)
  return `${double(d.getHours())}:${double(d.getMinutes())}:${double(d.getSeconds())}`
}

function double (n) {
  return (n < 10 ? '0' : '') + n
}

function pick (processes, idPosition, namePosition, valuePositions) {
  let re = {}
  processes.forEach((process) => {
    valuePositions.forEach((valuePosition) => {
      if (!re[valuePosition]) {
        re[valuePosition] = {}
      }
      let id = process[idPosition]
      re[valuePosition][id] = {
        id: +process[idPosition],
        name: process[namePosition],
        value: +process[valuePosition]
      }
    })
  })
  return re
}

class DataStore {
  constructor () {
    this.store = {}
  }

  column (name) {
    let re = []
    for (let i in this.store) {
      re.push({
        id: +this.store[i].pid,
        name: this.store[i].cmd,
        data: this.store[i].getByName(name)
      })
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

window.Watcher = Watcher
