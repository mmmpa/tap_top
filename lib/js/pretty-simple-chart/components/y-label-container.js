import React from '../../lib/react';
import YLabel from './y-label';

export default class YLabelContainer {
  get labels () {
    const { conf } = this.props;

    const {
      h: height,
      yMax,
      yLabelStep,
    } = conf;

    const l = Math.round(yMax / yLabelStep);
    const yStep = height / (yMax / yLabelStep);
    const ls = [];

    for (let i = 0; i <= l; i++) {
      ls.push(<YLabel
        conf={conf}
        label={i * yLabelStep}
        top={height - (yStep * i)}
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
