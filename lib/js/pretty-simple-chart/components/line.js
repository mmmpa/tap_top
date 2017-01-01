import { Component, h, cloneElement } from 'preact';

const React = { Component, cloneElement, createElement: h };

export default class Line {
  get hub () {
    return this.props.conf.innerHub;
  }

  computeX (position, length) {
    const { w } = this.props.conf;

    return ((w + 1) / (length - 1)) * position;
  }

  computeY (value) {
    const {
      h: height,
      yMax,
    } = this.props.conf;

    return height - (height * (value / yMax));
  }

  get lineValue () {
    const {
      stack,
      w: width,
      h: height,
    } = this.props.conf;

    const { line } = this.props;

    const start = -1;
    const end = width + 1;

    let d = `M ${start} ${this.computeY(line[0])} `;
    const l = line.length;

    for (let i = 1; i < l; i++) {
      d += `L ${this.computeX(i, l)} ${this.computeY(line[i])}`;
    }

    if (stack) {
      d += `L ${end} ${height} L ${start} ${h}`;
    }

    return d;
  }

  render () {
    const { stack } = this.props.conf;

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
          fill={stack ? color : 'none'}
          d={this.lineValue}
          style={{ stroke: color, strokeWidth: thickness }}
        />
      </g>
    );
  }
}
