import { Component, h, render, cloneElement } from 'preact';
import hub from './utils/hub'
import { EventEmitter } from 'events';
import { Configure } from '../index'
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


export function renderChart (domID, conf) {
  render(
    <ChartComponent conf={conf}/>,
    document.querySelector(`#${domID}`)
  )
}

export default class ChartComponent extends React.Component {
  componentWillMount () {
    let { name, data, size, stack, xLabels } = this.props.conf

    this.state = {
      data: new ChartData(data, size, stack),
      xLabels: (xLabels || []).concat(),
      wait: 0,
      innerHub: new EventEmitter(),
      selectedID: -1,
    }

    hub.on(name, (e) => this.receive(e))
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
        toggleRow: (...args) => this.toggleRow(...args),
        data: row,
        color,
        conf,
      }

      if (conf.stack) {
        lineConfiguration.line = row.stack

        ls.push(<Line {...lineConfiguration}/>)
      } else {
        lineConfiguration.line = row.data

        if (strong && selectedID === row.id) {
          lineConfiguration.thickness = 3
          selectedLine = <Line {...lineConfiguration}/>
        } else {
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
        toggleRow: (...args) => this.toggleRow(...args),
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
    conf.innerHub = this.state.innerHub

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
