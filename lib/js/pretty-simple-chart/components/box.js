import React from '../../lib/react';
import BoxBG from './box-bg';

export default function Box (props) {
  const { children } = props;

  const {
    w: width,
    h: height,
    yLabelWidth,
  } = props.conf;

  const viewBox = `0 0 ${width} ${height}`;

  const style = {
    top: 0,
    left: yLabelWidth,
    width,
    height,
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
