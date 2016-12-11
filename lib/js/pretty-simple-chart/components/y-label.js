import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

export default class YLabel {
  render () {
    let { top, label: raw } = this.props
    let { yLabelWidth, yLabelFormat } = this.props.conf
    let label = yLabelFormat ? yLabelFormat(raw) : raw

    return <div
      className="ps-chart ps-y-label"
      style={{
        top,
        width: yLabelWidth
      }}>{ label }</div>
  }
}
