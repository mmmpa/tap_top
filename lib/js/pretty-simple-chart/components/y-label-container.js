import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

import YLabel from './y-label'

export default class YLabelContainer {
  get labels () {
    let { conf } = this.props
    let { h, yMax, yLabelStep } = conf

    let l = Math.round(yMax / yLabelStep)
    let yStep = h / (yMax / yLabelStep)

    let ls = []

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
    return <div
      className="ps-chart ps-y-label-container"
      style={{
        top: 0,
        left: 0
      }}>{this.labels}</div>
  }
}
