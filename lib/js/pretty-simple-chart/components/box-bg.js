import React from '../../lib/react';

export default class BoxBG extends React.Component {
  shouldComponentUpdate () {
    return false;
  }

  get horizontalLines () {
    const { conf } = this.props;

    const {
      chartWidth,
      chartHeight,
      yValueMax,
      yLabelStepRange,
    } = conf;

    const l = Math.round(yValueMax / yLabelStepRange);
    const yStep = chartHeight / (yValueMax / yLabelStepRange);

    const ls = [];

    for (let i = 0; i <= l; i++) {
      const y = yStep * i;

      ls.push(<line
        x1={0}
        x2={chartWidth}
        y1={y}
        y2={y}
        style={{ stroke: '#ecf0f1', strokeWidth: 1 }}
      />);
    }

    return ls;
  }

  get verticalLines () {
    const {
      chartWidth,
      chartHeight,
      xSize,
    } = this.props.conf;

    const xStep = chartWidth / (xSize - 1);

    const ls = [];

    for (let i = 0; i < xSize; i++) {
      const x = xStep * i;

      ls.push(<line
        x1={x}
        x2={x}
        y1={0}
        y2={chartHeight}
        style={{ stroke: '#ecf0f1', strokeWidth: 1, strokeDasharray: '2, 4' }}
      />);
    }

    return ls;
  }

  render () {
    return (
      <g>
        {this.horizontalLines}
        {this.verticalLines}
      </g>
    );
  }
}
