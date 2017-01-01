import { Component, h, cloneElement } from 'preact';

const React = { Component, cloneElement, createElement: h };

export default class RowItem {
  get hub () {
    return this.props.conf.innerHub;
  }

  render () {
    const {
      name,
      color,
      id,
    }  = this.props.data;

    const {
      value,
      selected,
    } = this.props;

    const additionalClassName = selected ? 'ps-row-item-selected' : '';

    return (
      <div
        className={`ps-chart ps-row-item ${additionalClassName}`}
        onMouseOver={() => this.hub.emit('toggleRow', { id, selecting: true })}
      >
        <div className="ps-chart ps-row-item-color" style={{ color }} >■</div>
        <div className="ps-chart ps-row-item-name" >{name}</div>
        <div className="ps-chart ps-row-item-value" >{value}</div>
      </div>
    );
  }
}
