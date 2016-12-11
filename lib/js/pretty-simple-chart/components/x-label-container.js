import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

import XLabel from './x-label'

export default class XLabelContainer extends React.Component {
  get labels () {
    let { conf } = this.props
    let { w, xSize, xLabelFormat } = conf

    let xStep = w / (xSize - 1)

    let ls = []

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
    let { conf } = this.props
    let { w, h, yLabelWidth, xLabelHeight } = conf

    return <div
      className="ps-chart ps-x-label-container"
      style={{
        conf,
        top: h,
        left: yLabelWidth,
        width: w,
        height: xLabelHeight
      }}>{this.labels}</div>
  }
}
