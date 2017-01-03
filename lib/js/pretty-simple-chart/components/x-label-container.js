import React from '../../lib/react';
import XLabel from './x-label';

export default class XLabelContainer extends React.Component {
  get labels () {
    const { conf } = this.props;

    const {
      chartWidth,
      dataLength,
      xLabelFormat,
    } = conf;

    const xStep = chartWidth / (dataLength - 1);
    const ls = [];

    for (let i = 0; i < dataLength; i++) {
      const xl = this.props.labels[i] || 0;
      ls.push(<XLabel
        conf={conf}
        label={xLabelFormat ? xLabelFormat(xl) : xl}
        left={xStep * i}
        top={0}
      />);
    }

    return ls;
  }

  render () {
    const { conf } = this.props;

    const {
      chartWidth,
      chartHeight,
      yLabelWidth,
      xLabelHeight,
    } = conf;

    const style = {
      top: chartHeight,
      left: yLabelWidth,
      width: chartWidth,
      height: xLabelHeight,
    };

    return (
      <div
        className="ps-chart ps-x-label-container"
        style={style}
      >
        {this.labels}
      </div>
    );
  }
}
