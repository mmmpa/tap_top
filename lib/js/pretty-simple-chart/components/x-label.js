import React from '../../lib/react';

export default class XLabel extends React.Component {
  componentDidMount () {
    this.reset();
  }

  reset () {
    if (this.props.centering) {
      setTimeout(() => {
        this.setState({ offset: -this.innerLabel.clientWidth / 2 });
      }, 0);
    }
  }

  render () {
    const {
      left,
      label,
    } = this.props;

    const labelRotation = this.props.conf.xLabelRotate || 0;

    return (
      <div
        className="ps-chart ps-x-label"
        style={{
          left,
          transform: `rotateZ(${labelRotation}deg)`,
        }}
      >
        <div
          className="ps-chart ps-x-label-inner"
          ref={l => (this.innerLabel = l)}
          style={{ left: this.state.offset }}
        >
          {label}
        </div>
      </div>
    );
  }
}
