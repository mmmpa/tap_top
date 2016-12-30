import { Component, h, render, cloneElement } from 'preact';
import { EventEmitter } from 'events';
import ChartData from './models/chart-data'

const React = { Component, cloneElement, createElement: h }
const ReactDOM = { render }

const waitCount = 0

import XLabelContainer from './components/x-label-container'
import YLabelContainer from './components/y-label-container'
import Box from './components/box'
import Line from './components/line'
import RowItemContainer from './components/row-item-container'
import RowItem from './components/row-item'

export default class PrettySimpleChart {
  constructor (domID, conf) {
    this.conf = conf
    this.domID = domID
    this.hub = new EventEmitter()
  }

  add ({ data, xLabel }) {
    this.hub.emit('send', { type: 'add', data, xLabel })
  }

  render () {
    render(
      <ChartComponent hub={this.hub} conf={this.conf}/>,
      document.querySelector(`#${this.domID}`)
    )

    return this
  }
}

export class ChartComponent extends React.Component {
  componentWillMount () {
    let { hub } = this.props
    let { data, size, stack, xLabels } = this.props.conf
    this.props.conf.innerHub = this.innerHub

    this.state = {
      data: new ChartData(data, size, stack),
      xLabels: (xLabels || []).concat(),
      wait: 0,
      selectedID: -1,
    }

    hub.on('send', (e) => this.receive(e))
    this.innerHub.on('toggleRow', ({ id, selecting }) => this.toggleRow(id, selecting))
  }

  get innerHub () {
    return this._innerHub || (this._innerHub = new EventEmitter())
  }

  receive (e) {
    switch (e.type) {
      case 'add':
        this.add(e.data, e.xLabel)
        break
      default:
      //
    }
  }

  add (newData, xLabel) {
    this.state.data.add(newData)

    let newLabels = this.state.xLabels
    if (xLabel) {
      newLabels = newLabels.concat()
      newLabels.shift()
      newLabels.push(xLabel)
    }

    this.setState({
      data: this.state.data,
      xLabels: newLabels,
      wait: waitCount
    })
  }

  toggleRow (selectedID, isSelecting = true) {
    isSelecting
      ? this.setState({ selectedID })
      : this.setState({ selectedID: -1 })
  }

  get lines () {
    let { conf } = this.props
    let { selectedID } = this.state
    let strong = this.state.selectedID !== -1

    let ls = []
    let selectedLine = []

    for (let i in this.state.data.data) {
      let row = this.state.data.data[i]
      let color = strong && selectedID !== row.id
        ? '#bdc3c7'
        : row.color

      let lineConfiguration = {
        data: row,
        color,
        conf,
      }

      if (conf.stack) {
        lineConfiguration.line = row.stack
        lineConfiguration.thickness = 0

        ls.push(<Line {...lineConfiguration}/>)
      } else {
        lineConfiguration.line = row.data

        if (strong && selectedID === row.id) {
          lineConfiguration.thickness = 4
          selectedLine = <Line {...lineConfiguration}/>
        } else {
          lineConfiguration.thickness = 2
          ls.push(<Line {...lineConfiguration}/>)
        }
      }
    }

    selectedLine && ls.unshift(selectedLine)

    return ls.reverse()
  }

  get rowItems () {
    let { conf } = this.props
    let { selectedID } = this.state
    let { yLabelFormat } = conf
    let items = []

    for (let i in this.state.data.data) {
      let data = this.state.data.data[i]
      let value = data.data[data.data.length - 1]
      yLabelFormat && (value = yLabelFormat(value))

      items.push(<RowItem {...{
        selected: data.id === selectedID,
        value,
        data,
        conf
      }}/>)
    }

    return items.reverse()
  }

  render () {
    let { conf } = this.props
    let { w, h, yLabelWidth, xLabelHeight } = this.props.conf

    return <div className="ps-chart ps-container" {...{
      onClick: ()=> this.setState({ selectedID: -1 }),
      style: { width: w + yLabelWidth, height: h + xLabelHeight }
    }}>
      <YLabelContainer {...{ conf }}/>
      <XLabelContainer {...{ conf, labels: this.state.xLabels }}/>
      <Box {...{ conf }}>
        {this.lines}
      </Box>
      <RowItemContainer {...{ conf }}>
        {this.rowItems}
      </RowItemContainer>
    </div>
  }
}
