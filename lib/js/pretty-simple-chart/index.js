import { EventEmitter } from 'events';

import React from '../lib/react';
import ReactDOM from '../lib/react-dom';

import Chart from './components/chart';

export default class PrettySimpleChart {
  constructor (domID, conf) {
    this.conf = conf;
    this.domID = domID;
    this.hub = new EventEmitter();
  }

  add ({ data, xLabel }) {
    this.hub.emit('send', { type: 'add', data, xLabel });
  }

  render () {
    ReactDOM.render(
      <Chart
        hub={this.hub}
        conf={this.conf}
      />,
      document.querySelector(`#${this.domID}`),
    );

    return this;
  }
}
