import { EventEmitter } from 'events';

import React from '../../lib/react';

import ChartData from '../models/chart-data';

import XLabelContainer from './x-label-container';
import YLabelContainer from './y-label-container';
import Box from './box';
import Line from './line';
import RowItemContainer from './row-item-container';
import RowItem from './row-item';

const waitCount = 0;

export default class Chart extends React.Component {
  componentWillMount () {
    const { hub } = this.props;

    const {
      data,
      dataLength,
      isStackChart: isStack,
      xLabels,
    } = this.props.conf;

    this.props.conf.innerHub = this.innerHub;

    this.state = {
      data: new ChartData({ data, dataLength, isStack }),
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
    let selectedLine;

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

      if (conf.isStackChart) {
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
      chartWidth,
      chartHeight,
      yLabelWidth,
      xLabelHeight,
    } = conf;

    const style = {
      width: chartWidth + yLabelWidth,
      height: chartHeight + xLabelHeight,
    };

    return (
      <div
        className="ps-chart ps-container"
        onClick={() => this.setState({ selectedID: -1 })}
        style={style}
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
