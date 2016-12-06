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
    let processList = {}

    this.conf.initialData.forEach(({ time, processes, rowPositions }, i) => {
      // manage time
      this.timeList.push(time * 1000 + '')

      if (!processes) {
        return {}
      }

      // manage processes
      processes.forEach((process) => {
        let pid = process[rowPositions.PID]
        let cmd = process[rowPositions.COMMAND]
        if (cmd.indexOf('/top') != -1 || cmd === 'top') {
          return
        }

        let pidQueue = processList[pid]
          ? processList[pid]
          : processList[pid] = {
          pid,
          cmd,
          rowPositions,
          data: Configure.dataArray
        }

        pidQueue.data[i] = { process }
      })
    })

    console.log(processList, pickRow('%CPU', processList))

    render(
      <ChartComponent
        name='PerCPU'
        data={ pickRow('%CPU', processList) }
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
        data={ pickRow('%MEM', processList) }
        xLabels={ this.timeList }
        conf={{
          stack: true,
          w: 800,
          h: 600,
          xLabelHeight: 70,
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

function pickRow (rowName, processList) {
  let re = {}
  for (let i in processList) {
    let now = processList[i]
    if(now.cmd.indexOf('top') !== -1) {
      continue
    }
    let pos = now.rowPositions[rowName]
    re[i] = {
      id: +now.pid,
      name: now.cmd,
      data: now.data.map((d) => {
        return d.process ? +d.process[pos] : 0
      })
    }
  }
  return re
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
      if(process[namePosition].indexOf('top') !== -1) {
        return
      }
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
    let re = {}
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
}

window.Watcher = Watcher
