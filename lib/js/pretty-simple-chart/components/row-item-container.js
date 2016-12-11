import { Component, h, render, cloneElement } from 'preact';
const React = { Component, cloneElement, createElement: h }

export default class RowItemContainer {
  render () {
    let { w, h, xLabelHeight, rowItemWidth } = this.props.conf
    return <div
      className="ps-chart ps-row-item-container"
      style={{
        top: 0,
        left: w + xLabelHeight,
        width: rowItemWidth,
        height: h + xLabelHeight
      }}>
      {this.props.children}
    </div>
  }
}
