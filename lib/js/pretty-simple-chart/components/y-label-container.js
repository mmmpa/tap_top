import React from '../../lib/react';
import YLabel from './y-label';

export default class YLabelContainer {
  get labels () {
    const { conf } = this.props;

    const {
      chartHeight,
      yValueMax,
      yLabelStepRange,
    } = conf;

    const l = Math.round(yValueMax / yLabelStepRange);
    const yStep = chartHeight / (yValueMax / yLabelStepRange);
    const ls = [];

    for (let i = 0; i <= l; i++) {
      ls.push(<YLabel
        conf={conf}
        label={i * yLabelStepRange}
        top={chartHeight - (yStep * i)}
      />);
    }

    return ls;
  }

  render () {
    return (
      <div
        className="ps-chart ps-y-label-container"
        style={{
          top: 0,
          left: 0,
        }}
      >
        {this.labels}
      </div>
    );
  }
}
