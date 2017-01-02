import React from '../../lib/react';

export default class Line {
  get hub () {
    return this.props.conf.innerHub;
  }

  computeX (position, length) {
    const { chartWidth } = this.props.conf;

    return ((chartWidth + 1) / (length - 1)) * position;
  }

  computeY (value) {
    const {
      chartHeight,
      yValueMax,
    } = this.props.conf;

    return chartHeight - (chartHeight * ((value || 0) / yValueMax));
  }

  get lineValue () {
    const {
      isStackChart,
      chartWidth,
      chartHeight,
    } = this.props.conf;

    const { line } = this.props;

    const start = -1;
    const end = chartWidth + 1;

    let d = `M ${start} ${this.computeY(line[0])} `;
    const l = line.length;

    for (let i = 1; i < l; i++) {
      d += `L ${this.computeX(i, l)} ${this.computeY(line[i])}`;
    }


    if (isStackChart) {
      d += `L ${end} ${chartHeight} L ${start} ${chartHeight}`;
    }

    return d;
  }

  render () {
    const { isStackChart } = this.props.conf;

    const {
      color,
      thickness,
    } = this.props;

    const {
      id,
      name,
    } = this.props.data;

    return (
      <g id={name + id} key={name} >
        <path
          onMouseOver={() => this.hub.emit('toggleRow', { id, selecting: true })}
          fill={isStackChart ? color : 'none'}
          d={this.lineValue}
          style={{ stroke: color, strokeWidth: thickness }}
        />
      </g>
    );
  }
}
