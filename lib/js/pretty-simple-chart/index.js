import { EventEmitter } from 'events';

import React from '../lib/react';
import ReactDOM from '../lib/react-dom';

import ChartData from './models/chart-data';

import XLabelContainer from './components/x-label-container';
import YLabelContainer from './components/y-label-container';
import Box from './components/box';
import Line from './components/line';
import RowItemContainer from './components/row-item-container';
import RowItem from './components/row-item';

const waitCount = 0;

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
      <ChartComponent
        hub={this.hub}
        conf={this.conf}
      />,
      document.querySelector(`#${this.domID}`),
    );

    return this;
  }
}

export class ChartComponent extends React.Component {
  componentWillMount () {
    const { hub } = this.props;

    const {
      data,
      size,
      stack,
      xLabels,
    } = this.props.conf;

    this.props.conf.innerHub = this.innerHub;

    this.state = {
      data: new ChartData(data, size, stack),
      xLabels: (xLabels || []).concat(),
      wait: 0,
      selectedID: -1,
    };

    hub.on('send', e => this.receive(e));
    this.innerHub.on('toggleRow', ({ id, selecting }) => this.toggleRow(id, selecting));
  }

  get innerHub () {
    return this.pInnerHub || (this.pInnerHub = new EventEmitter());
  }

  receive (e) {
    switch (e.type) {
      case 'add':
        this.add(e.data, e.xLabel);
        break;
      default:
      //
    }
  }

  add (newData, xLabel) {
    this.state.data.add(newData);

    let newLabels = this.state.xLabels;
    if (xLabel) {
      newLabels = newLabels.concat();
      newLabels.shift();
      newLabels.push(xLabel);
    }

    this.setState({
      data: this.state.data,
      xLabels: newLabels,
      wait: waitCount,
    });
  }

  toggleRow (selectedID, isSelecting = true) {
    isSelecting
      ? this.setState({ selectedID })
      : this.setState({ selectedID: -1 });
  }

  get lines () {
    const { conf } = this.props;
    const { selectedID } = this.state;
    const strong = this.state.selectedID !== -1;

    const ls = [];
    let selectedLine = [];

    Object.keys(this.state.data.data).forEach((i) => {
      const row = this.state.data.data[i];
      const color = strong && selectedID !== row.id
        ? '#bdc3c7'
        : row.color;

      const lineConfiguration = {
        data: row,
        color,
        conf,
      };

      if (conf.stack) {
        lineConfiguration.line = row.stack;
        lineConfiguration.thickness = 0;

        ls.push(<Line {...lineConfiguration} />);
      } else {
        lineConfiguration.line = row.data;

        if (strong && selectedID === row.id) {
          lineConfiguration.thickness = 4;
          selectedLine = <Line {...lineConfiguration} />;
        } else {
          lineConfiguration.thickness = 2;
          ls.push(<Line {...lineConfiguration} />);
        }
      }
    });

    selectedLine && ls.unshift(selectedLine);

    return ls.reverse();
  }

  get rowItems () {
    const { conf } = this.props;
    const { selectedID } = this.state;
    const { yLabelFormat } = conf;
    const items = [];

    Object.keys(this.state.data.data).forEach((i) => {
      const data = this.state.data.data[i];
      let value = data.data[data.data.length - 1];
      yLabelFormat && (value = yLabelFormat(value));

      items.push(<RowItem
        selected={data.id === selectedID}
        value={value}
        data={data}
        conf={conf}
      />);
    });

    return items.reverse();
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
        className="ps-chart ps-container"
        onClick={() => this.setState({ selectedID: -1 })}
        style={{ width: width + yLabelWidth, height: height + xLabelHeight }}
      >
        <YLabelContainer {...this.props} />
        <XLabelContainer
          labels={this.state.xLabels}
          {...this.props}
        />
        <Box {...this.props}>
          {this.lines}
        </Box>
        <RowItemContainer {...this.props}>
          {this.rowItems}
        </RowItemContainer>
      </div>
    );
  }
}
