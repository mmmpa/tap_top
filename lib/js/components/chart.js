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
      xLabels: (this.props.xLabels || []).concat(),
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
        this.add(e.data, e.xLabel)
      default:
      //
    }
  }

  clone (data) {
    return data.map(({ id, name, data }) => {
      return { id, name, data: data.concat() }
    })
  }

  add (newData, xLabel) {
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

    let newLabels = this.state.xLabels
    if(xLabel) {
      newLabels = newLabels.concat()
      newLabels.shift()
      newLabels.push(xLabel)
    }

    this.setState({ data, xLabels: newLabels, stored: this.clone(data), wait: waitCount })
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
        {this.state.data.map((d)=> {
          return <Line data={d} {...{ conf }}/>
        })}
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
    let width = w + 'px'
    let height = h + 'px'
    let viewBox = `0 0 ${w} ${h}`
    return <svg
      className="ps-chart ps-line-box"
      style={{ top: 0, left: yLabelWidth }}
      x="0px"
      y="0px"
      {...{ width, height, viewBox }}>
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
    let { w, h, yLabelWidth, yMax, yLabelStep } = this.props.conf
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
      ls.push(<line {...a} style={`stroke:#ecf0f1; stroke-width:1`}/>)
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
      ls.push(<line {...a} style={`stroke:#ecf0f1; stroke-width:1`}/>)
    }

    return ls
  }


  render () {
    return <g>
      {this.horizontalLines}
      {this.verticalLines}
    </g>
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

    return (w / (length - 1)) * position
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

    let pre
    let l = data.length


    return <g {...{ onMouseOver }}>{data.map((d, i)=> {

      let now = {
        x1: pre ? pre.x : 0,
        y1: pre ? pre.y : 0,
        x2: this.computeX(i, l),
        y2: this.computeY(d)
      }

      let re = pre
        ? <line {...now} style={`stroke:${this.state.color};stroke-width:1`}/>
        : null

      pre = { x: now.x2, y: now.y2 }
      return re
    })}</g>
  }
}