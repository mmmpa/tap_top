import { Component, h, cloneElement } from 'preact';
import XLabel from './x-label';

const React = { Component, cloneElement, createElement: h };


export default class XLabelContainer extends React.Component {
  get labels () {
    const { conf } = this.props;

    const {
      w,
      xSize,
      xLabelFormat,
    } = conf;

    const xStep = w / (xSize - 1);
    const ls = [];

    for (let i = 0; i < xSize; i++) {
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
      w: width,
      h: height,
      yLabelWidth,
      xLabelHeight,
    } = conf;

    return (
      <div
        className="ps-chart ps-x-label-container"
        style={{
          conf,
          top: height,
          left: yLabelWidth,
          width,
          height: xLabelHeight,
        }}
      >
        {this.labels}
      </div>
    );
  }
}
