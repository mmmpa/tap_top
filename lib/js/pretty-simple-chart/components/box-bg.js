import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

export default class BoxBG extends React.Component {
  shouldComponentUpdate () {
    return false
  }

  get horizontalLines () {
    let { conf } = this.props
    let { w, h, yMax, yLabelStep } = conf

    let l = Math.round(yMax / yLabelStep)
    let yStep = h / (yMax / yLabelStep)

    let ls = []

    for (let i = 0; i <= l; i++) {
      let y = yStep * i

      ls.push(<line {...{
        x1: 0,
        x2: w,
        y1: y,
        y2: y,
        style: { stroke: '#ecf0f1', strokeWidth: 1 }
      }}/>)
    }

    return ls
  }

  get verticalLines () {
    let { w, h, xSize } = this.props.conf

    let xStep = w / (xSize - 1)

    let ls = []

    for (let i = 0; i < xSize; i++) {
      let x = xStep * i

      ls.push(<line {...{
        x1: x,
        x2: x,
        y1: 0,
        y2: h,
        style: { stroke: '#ecf0f1', strokeWidth: 1, strokeDasharray: "2, 4" }
      }}/>)
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
