import { Component, h, render, cloneElement } from 'preact';
import hub from '../utils/hub'
import { EventEmitter } from 'events';
import { Configure } from '../index'
import ChartData from '../models/chart-data'

const React = { Component, cloneElement, createElement: h }
const ReactDOM = { render }

const waitCount = 0

export default class ChartComponent extends React.Component {
  componentWillMount () {
    this.state = {
      data: new ChartData(this.props.data, Configure.size, this.props.conf.stack),
      xLabels: (this.props.xLabels || []).concat(),
      wait: 0,
      innerHub: new EventEmitter()
    }

    this.state.innerHub.on('line:over', (e) => this.strong(e))
    hub.on(this.props.name, (e) => this.receive(e))
  }

  strong (e) {
  }

  receive (e) {
    switch (e.type) {
      case 'add':
        this.add(e.data, e.xLabel)
      default:
      //
    }
  }

  add (newData, xLabel) {
    this.state.data.add(newData)

    let newLabels = this.state.xLabels
    if (xLabel) {
      newLabels = newLabels.concat()
      newLabels.shift()
      newLabels.push(xLabel)
    }

    this.setState({
      data: this.state.data,
      xLabels: newLabels,
      wait: waitCount
    })
  }

  get lines () {
    let { conf } = this.props
    let ls = []
    for (let i in this.state.data.data) {
      let row = this.state.data.data[i]
      if (conf.stack) {
        ls.push(
          <Line line={row.stack} data={row} {...{ conf }}/>)
      } else {
        ls.push(
          <Line line={row.data} data={row} {...{ conf }}/>)
      }
    }
    return ls
  }

  render () {
    let { conf } = this.props
    let { w, h, yLabelWidth, xLabelHeight } = this.props.conf
    conf.innerHub = this.state.innerHub

    return <div
      className="ps-chart ps-container"
      style={{ width: w + yLabelWidth, height: h + xLabelHeight }}>
      <YLabelContainer {...{ conf }}/>
      <XLabelContainer {...{ conf, labels: this.state.xLabels }}/>
      <Box {...{ conf }}>
        {this.lines}
      </Box>
    </div>
  }
}

class YLabelContainer {
  get labels () {
    let { conf } = this.props
    let { w, h, yLabelWidth, yMax, yLabelStep } = this.props.conf
    let ls = []
    let l = Math.round(yMax / yLabelStep)
    let yStep = h / (yMax / yLabelStep)
    for (let i = 0; i <= l; i++) {
      ls.push(<YLabel {...{
        conf,
        label: i * yLabelStep,
        top: h - yStep * i
      }}/>)
    }

    return ls
  }

  render () {
    let { w, h, yLabelWidth, yMax, yLabelStep } = this.props.conf

    return <div className="ps-chart ps-y-label-container" style={{
      top: 0,
      left: 0
    }}>{this.labels}</div>
  }
}

class XLabelContainer extends React.Component {
  get labels () {
    let { conf } = this.props
    let { w, h, yLabelWidth, yMax, yLabelStep, xSize, xLabelFormat } = this.props.conf
    let ls = []
    let l = Math.round(yMax / yLabelStep)
    let xStep = w / (xSize - 1)
    for (let i = 0; i < xSize; i++) {
      let xl = this.props.labels[i] || 0
      ls.push(<XLabel {...{
        conf,
        label: xLabelFormat ? xLabelFormat(xl) : xl,
        left: xStep * i,
        top: 0
      }}/>)
    }

    return ls
  }

  render () {
    let { w, h, yLabelWidth, yMax, yLabelStep, xLabelHeight } = this.props.conf

    return <div className="ps-chart ps-x-label-container" style={{
      top: h,
      left: yLabelWidth,
      width: w,
      height: xLabelHeight
    }}>{this.labels}</div>
  }
}

class YLabel {
  render () {
    let { top, label } = this.props
    let { yLabelWidth, yLabelFormat } = this.props.conf

    return <div className="ps-chart ps-y-label" style={{
      top,
      width: yLabelWidth
    }}>{ yLabelFormat ? yLabelFormat(label) : label }</div>
  }
}


class XLabel extends React.Component {
  componentDidMount () {
    this.reset()
  }

  reset () {
    if (this.props.centering) {
      setTimeout(()=> {
        this.setState({
          offset: -this.innerLabel.clientWidth / 2
        })
      }, 0)
    }
  }

  render () {
    let { left, label } = this.props
    return <div className="ps-chart ps-x-label" style={{
      left,
      transform: `rotateZ(${this.props.conf.xLabelRotate || 0}deg)`
    }}>
      <div className="ps-chart ps-x-label-inner" ref={(l) => this.innerLabel = l} style={{ left: this.state.offset }}>{label}</div>
    </div>
  }
}

class Box {
  render () {
    let { conf } = this.props
    let { w, h, yLabelWidth, xLabelHeight } = conf
    let width = w
    let height = h
    let viewBox = `0 0 ${w} ${h}`
    return <svg
      className="ps-chart ps-line-box"
      style={{ top: 0, left: yLabelWidth, width, height }}
      x="0px"
      y="0px"
      {...{ viewBox }}>
      <BoxBG {...{ conf }}/>
      { this.props.children }
    </svg>
  }
}

class BoxBG extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  get horizontalLines () {
    let { conf } = this.props
    let { w, h, yLabelWidth, yMax, yLabelStep } = conf
    let ls = []
    let l = Math.round(yMax / yLabelStep)
    let yStep = h / (yMax / yLabelStep)
    for (let i = 0; i <= l; i++) {
      let y = yStep * i
      let a = {
        x1: 0,
        x2: w,
        y1: y,
        y2: y
      }
      ls.push(<line {...a} style={`stroke:#ecf0f1; stroke-width:1;`}/>)
    }

    return ls
  }

  get verticalLines () {
    let { w, h, yLabelWidth, yMax, yLabelStep, xSize, xLabelFormat } = this.props.conf
    let ls = []
    let l = Math.round(yMax / yLabelStep)
    let xStep = w / (xSize - 1)

    for (let i = 0; i < xSize; i++) {
      let x = xStep * i
      let a = {
        x1: x,
        x2: x,
        y1: 0,
        y2: h
      }
      ls.push(
        <line {...a} style={`stroke:#ecf0f1; stroke-width:1`} stroke-dasharray="2, 4"/>)
    }

    return ls
  }


  render () {
    return <g x="0px" y="0px">
      {this.horizontalLines}
      {this.verticalLines}
    </g>
  }
}

// y 位置は高さから逆算
class Line {
  computeX (position, length) {
    let { w } = this.props.conf

    return (w / (length - 1)) * position
  }

  computeY (value) {
    let { h, yMax } = this.props.conf

    return h - h * (value / yMax)
  }

  get lineValue () {
    let { line } = this.props
    let d = `M 0 ${this.computeY(line[0])} `

    let l = line.length
    for (let i = 1; i < l; i++) {
      d += `L ${this.computeX(i, l)} ${this.computeY(line[i])}`
    }

    return d
  }

  render () {
    let { line } = this.props

    let onMouseOver = (e) => {
      this.props.conf.innerHub.emit('line:over', {
        name: this.props.data.name,
        color: this.state.color,
        e
      })
    }

    return <g id={this.props.data.name + this.props.data.id} {...{ onMouseOver }} key={this.props.data.name}>
        <path fill="none" d={this.lineValue} style={`stroke:${this.props.data.color};stroke-width:1`}/>
      </g>
  }
}