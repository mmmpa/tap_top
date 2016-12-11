import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

import BoxBG from './box-bg'

export default class Box {
  render () {
    let { conf } = this.props
    let { w, h, yLabelWidth } = conf
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
