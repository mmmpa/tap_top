import { Component, h, render, cloneElement } from 'preact';
import { numToColor } from '../utils/color-wheel'
import hub from '../utils/hub'
import { EventEmitter } from 'events';
import { Configure } from '../index'

const React = { Component, cloneElement, createElement: h }
const ReactDOM = { render }

const waitCount = 0

export default class ChartComponent extends React.Component {
  componentWillMount () {
    this.state = {
      data: this.initializeData(this.props.data),
      stored: this.clone(this.props.data),
      wait: 0,
      innerHub: new EventEmitter()
    }

    this.state.innerHub.on('line:over', (e) => this.strong(e))
    hub.on(this.props.name, (e) => this.receive(e))
  }

  initializeData (data) {
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

    return newData
  }

  strong (e) {
    console.log(e)
  }

  receive (e) {
    switch (e.type) {
      case 'add':
        this.add(e.data)
      default:
      //
    }
  }

  clone (data) {
    return data.map(({ id, name, data }) => {
      return { id, name, data: data.concat() }
    })
  }

  add (newData) {
    // 既存のデータを全トレースして、新しいデータになければ 0 あればそれを追加する

    let data = []
    let pre = 0
    this.state.stored.forEach((d) => {
      if (!d) {
        return
      }

      d.data.shift()

      let next
      if (newData[d.id]) {
        next = +newData[d.id].value
        delete newData[d.id]
      } else {
        next = 0
      }
      pre += next
      this.props.stack
        ? d.data.push(pre)
        : d.data.push(next)


      data.push(d)
    })

    for (let i in newData) {
      let { id, name, value } = newData[i]
      let data = Configure.dataArray
      data[data.length - 1] = value
      data.push({ id, name, data })
    }

    if (this.state.wait > 0) {
      this.setState({ stored: data, wait: this.state.wait - 1 })
    } else {
      this.setState({ data, stored: this.clone(data), wait: waitCount })
    }
  }

  render () {
    let { conf } = this.props
    conf.innerHub = this.state.innerHub

    return <div className="ps-chart ps-container">
      <Box {...{ conf }}>
        {this.state.data.map((d)=> {
          return <Line data={d} {...{ conf }}/>
        })}
      </Box>
    </div>
  }
}

class Box {
  render () {
    let { w, h } = this.props.conf
    let width = w + 'px'
    let height = h + 'px'
    let viewBox = `0 0 ${w} ${h}`
    return <svg className="ps-chart ps-line-box" x="0px" y="0px" {...{ width, height, viewBox }}>
      { this.props.children }
    </svg>
  }
}

// y 位置は高さから逆算
class Line {
  componentWillMount () {
    this.state = {
      color: numToColor(+this.props.data.id)
    }
  }

  computeX (position, length) {
    let { w } = this.props.conf

    return (w / length) * position
  }

  computeY (value) {
    let { h } = this.props.conf

    return h - h * (value / 100)
  }

  render () {
    let { data } = this.props.data

    let onMouseOver = (e) => {
      this.props.conf.innerHub.emit('line:over', {
        name: this.props.data.name,
        color: this.state.color,
        e
      })
    }

    let pre = {}
    let l = data.length


    return <g {...{ onMouseOver }}>{data.map((d, i)=> {

      let now = {
        x1: pre.x,
        y1: pre.y,
        x2: this.computeX(i, l),
        y2: this.computeY(d)
      }

      let re = pre.x
        ? <line {...now} style={`stroke:${this.state.color};stroke-width:1`}/>
        : null

      pre = { x: now.x2, y: now.y2 }
      return re
    })}</g>
  }
}