import { Component, h, cloneElement } from 'preact';

const React = { Component, cloneElement, createElement: h };

export default class BoxBG extends React.Component {
  shouldComponentUpdate () {
    return false;
  }

  get horizontalLines () {
    const { conf } = this.props;

    const {
      w: width,
      h: height,
      yMax,
      yLabelStep,
    } = conf;

    const l = Math.round(yMax / yLabelStep);
    const yStep = height / (yMax / yLabelStep);

    const ls = [];

    for (let i = 0; i <= l; i++) {
      const y = yStep * i;

      ls.push(<line
        x1={0}
        x2={width}
        y1={y}
        y2={y}
        style={{ stroke: '#ecf0f1', strokeWidth: 1 }}
      />);
    }

    return ls;
  }

  get verticalLines () {
    const {
      w: width,
      h: height,
      xSize,
    } = this.props.conf;

    const xStep = width / (xSize - 1);

    const ls = [];

    for (let i = 0; i < xSize; i++) {
      const x = xStep * i;

      ls.push(<line
        x1={x}
        x2={x}
        y1={0}
        y2={height}
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
