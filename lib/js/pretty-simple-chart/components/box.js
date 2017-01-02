import React from '../../lib/react';
import BoxBG from './box-bg';

export default function Box (props) {
  const { children } = props;

  const {
    chartWidth,
    chartHeight,
    yLabelWidth,
  } = props.conf;

  const viewBox = `0 0 ${chartWidth} ${chartHeight}`;

  const style = {
    top: 0,
    left: yLabelWidth,
    width: chartWidth,
    height: chartHeight,
  };

  return (
    <svg
      className="ps-chart ps-line-box"
      style={style}
      viewBox={viewBox}
    >
      <BoxBG {...props} />
      {children}
    </svg>
  );
}
