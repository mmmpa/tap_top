import React from '../../lib/react';

export default function YLabel (props) {
  const {
    top,
    label: raw,
  } = props;

  const {
    yLabelWidth,
    yLabelFormat,
  } = props.conf;

  const label = yLabelFormat ? yLabelFormat(raw) : raw;

  return (
    <div
      className="ps-chart ps-y-label"
      style={{
        top,
        width: yLabelWidth,
      }}
    >
      {label}
    </div>
  );
}
