const c3 = window.c3
const req = window.superagent

import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }
import ChartComponent from './components/chart'
import { EventEmitter } from 'events';
import { colors } from './utils/color-wheel';

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
    let memoryList = {
      1: { id: 1, color: '#bdc3c7', name: 'free', data: [] },
      2: { id: 2, color: '#e74c3c', name: 'used', data: [] },
      3: { id: 3, color: '#9b59b6', name: 'buffers', data: [] },
    }

    let CPUList = {
      1: { id: 1, color: '#e74c3c', name: 'User', data: [] },
      2: { id: 2, color: '#3498db', name: 'System', data: [] },
      3: { id: 3, color: '#1abc9c', name: 'Nice', data: [] },
      4: { id: 4, color: '#bdc3c7', name: 'Idle', data: [] },
      5: { id: 5, name: 'IOWait', data: [] },
      6: { id: 6, name: 'HardwareInterrupt', data: [] },
      7: { id: 7, name: 'SoftwareInterrupt', data: [] },
      8: { id: 8, name: 'StolenTime', data: [] },
    }

    this.conf.initialData.forEach(({ memory, cpu, time, processes, rowPositions }, i) => {
      // manage time
      this.timeList.push(time * 1000 + '')

      let { Total, Used, Free, Buffers } = memory

      this.totalMemory = +Total
      memoryList[1].data.push(Math.round(+Free / this.totalMemory * 1000) / 10)
      memoryList[2].data.push(Math.round(+Used / this.totalMemory * 1000) / 10)
      memoryList[3].data.push(Math.round(+Buffers / this.totalMemory * 1000) / 10)

      let { User, System, Nice, Idle, IOWait, HardwareInterrupt, SoftwareInterrupt, StolenTime } = cpu

      CPUList[1].data.push(User)
      CPUList[2].data.push(System)
      CPUList[3].data.push(Nice)
      CPUList[4].data.push(Idle)
      CPUList[5].data.push(IOWait)
      CPUList[6].data.push(HardwareInterrupt)
      CPUList[7].data.push(SoftwareInterrupt)
      CPUList[8].data.push(StolenTime)

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


    render(
      <ChartComponent
        name='totalCPU'
        data={ CPUList }
        xLabels={ this.timeList }
        conf={{
          stack: true,
          w: 600,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 20,
          yLabelFormat: (v) => v + ' %',
          xLabelFormat: (v) => dateString(v)
        }}/>,
      document.querySelector(`#${this.conf.totalCPU}`)
    )

    render(
      <ChartComponent
        name='totalMemory'
        data={ memoryList }
        xLabels={ this.timeList }
        conf={{
          stack: true,
          w: 600,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 20,
          yLabelFormat: (v) => v + ' %',
          xLabelFormat: (v) => dateString(v)
        }}/>,
      document.querySelector(`#${this.conf.totalMemory}`)
    )

    render(
      <ChartComponent
        name='PerCPU'
        data={ pickRow('%CPU', processList) }
        xLabels={ this.timeList }
        conf={{
          w: 600,
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
          w: 600,
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
          let { processes, rowPositions, time, cpu, memory } = res.body
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

          let memoryList = {
            1: { id: 1, color: '#bdc3c7', name: 'free', value: Math.round(memory.Free / this.totalMemory * 1000) / 10 },
            2: { id: 2, color: '#e74c3c', name: 'used', value: Math.round(memory.Used / this.totalMemory * 1000) / 10 },
            3: { id: 3, color: '#9b59b6', name: 'buffers', value: Math.round(memory.Buffers / this.totalMemory * 1000) / 10 },
          }

          hub.emit('totalMemory', {
            type: 'add', data: memoryList,
            xLabel: time
          })

          let CPUList = {
            1: { id: 1, name: 'User', value: cpu.User },
            2: { id: 2, name: 'System', value: cpu.System },
            3: { id: 3, name: 'Nice', value: cpu.Nice },
            4: { id: 4, name: 'Idle', value: cpu.Idle },
            5: { id: 5, name: 'IOWait', value: cpu.IOWait },
            6: {
              id: 6,
              name: 'HardwareInterrupt',
              value: cpu.HardwareInterrupt
            },
            7: {
              id: 7,
              name: 'SoftwareInterrupt',
              value: cpu.SoftwareInterrupt
            },
            8: { id: 8, name: 'StolenTime', value: cpu.StolenTime },
          }

          hub.emit('totalCPU', {
            type: 'add', data: CPUList,
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
    if (now.cmd.indexOf('top') !== -1) {
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
      if (process[namePosition].indexOf('top') !== -1) {
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
