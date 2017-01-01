import { Component, h, cloneElement } from 'preact';

const React = { Component, cloneElement, createElement: h };

export default class RowItemContainer {
  render () {
    const {
      w: width,
      h: height,
      xLabelHeight,
      rowItemWidth,
    } = this.props.conf;

    return (
      <div
        className="ps-chart ps-row-item-container"
        style={{
          top: 0,
          left: width + xLabelHeight,
          width: rowItemWidth,
          height: height + xLabelHeight,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
