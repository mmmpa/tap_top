import React from '../../lib/react';

export default class RowItemContainer {
  render () {
    const {
      chartWidth,
      chartHeight,
      xLabelHeight,
      dataItemListWidth,
    } = this.props.conf;

    return (
      <div
        className="ps-chart ps-row-item-container"
        style={{
          top: 0,
          left: chartWidth + xLabelHeight,
          width: dataItemListWidth,
          height: chartHeight + xLabelHeight,
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
