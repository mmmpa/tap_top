import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

export default class Line {
  get hub () {
    return this.props.conf.innerHub
  }

  computeX (position, length) {
    let { w } = this.props.conf

    return ((w + 1) / (length - 1)) * position
  }

  computeY (value) {
    let { h, yMax } = this.props.conf

    return h - h * (value / yMax)
  }

  get lineValue () {
    let { stack, w, h } = this.props.conf
    let { line } = this.props

    const start = -1
    const end = w + 1

    let d = `M ${start} ${this.computeY(line[0])} `
    let l = line.length
    for (let i = 1; i < l; i++) {
      d += `L ${this.computeX(i, l)} ${this.computeY(line[i])}`
    }

    if (stack) {
      d += `L ${end} ${h} L ${start} ${h}`
    }

    return d
  }

  render () {
    let { stack } = this.props.conf
    let { color, thickness, toggleRow } = this.props
    let { id, name } = this.props.data

    return <g id={name + id} key={name}>
      <path
        onMouseOver={()=> this.hub.emit('toggleRow', { id, selecting: true })}
        fill={stack ? color : 'none' }
        d={this.lineValue}
        style={{ stroke: color, strokeWidth: thickness }}/>
    </g>
  }
}
