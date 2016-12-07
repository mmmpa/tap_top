(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require('preact');

var _hub = require('../utils/hub');

var _hub2 = _interopRequireDefault(_hub);

var _events = require('events');

var _index = require('../index');

var _chartData = require('../models/chart-data');

var _chartData2 = _interopRequireDefault(_chartData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = { Component: _preact.Component, cloneElement: _preact.cloneElement, createElement: _preact.h };
var ReactDOM = { render: _preact.render };

var waitCount = 0;

var ChartComponent = function (_React$Component) {
  _inherits(ChartComponent, _React$Component);

  function ChartComponent() {
    _classCallCheck(this, ChartComponent);

    return _possibleConstructorReturn(this, (ChartComponent.__proto__ || Object.getPrototypeOf(ChartComponent)).apply(this, arguments));
  }

  _createClass(ChartComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      this.state = {
        data: new _chartData2.default(this.props.data, _index.Configure.size, this.props.conf.stack),
        xLabels: (this.props.xLabels || []).concat(),
        wait: 0,
        innerHub: new _events.EventEmitter()
      };

      this.state.innerHub.on('line:over', function (e) {
        return _this2.strong(e);
      });
      _hub2.default.on(this.props.name, function (e) {
        return _this2.receive(e);
      });
    }
  }, {
    key: 'strong',
    value: function strong(e) {}
  }, {
    key: 'receive',
    value: function receive(e) {
      switch (e.type) {
        case 'add':
          this.add(e.data, e.xLabel);
        default:
        //
      }
    }
  }, {
    key: 'add',
    value: function add(newData, xLabel) {
      this.state.data.add(newData);

      var newLabels = this.state.xLabels;
      if (xLabel) {
        newLabels = newLabels.concat();
        newLabels.shift();
        newLabels.push(xLabel);
      }

      this.setState({
        data: this.state.data,
        xLabels: newLabels,
        wait: waitCount
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var conf = this.props.conf;
      var _props$conf = this.props.conf,
          w = _props$conf.w,
          h = _props$conf.h,
          yLabelWidth = _props$conf.yLabelWidth,
          xLabelHeight = _props$conf.xLabelHeight;

      conf.innerHub = this.state.innerHub;

      return React.createElement(
        'div',
        {
          className: 'ps-chart ps-container',
          style: { width: w + yLabelWidth, height: h + xLabelHeight } },
        React.createElement(YLabelContainer, { conf: conf }),
        React.createElement(XLabelContainer, { conf: conf, labels: this.state.xLabels }),
        React.createElement(
          Box,
          { conf: conf },
          this.lines
        )
      );
    }
  }, {
    key: 'lines',
    get: function get() {
      var conf = this.props.conf;

      var ls = [];
      for (var i in this.state.data.data) {
        var row = this.state.data.data[i];
        if (conf.stack) {
          ls.push(React.createElement(Line, _extends({ line: row.stack, data: row }, { conf: conf })));
        } else {
          ls.push(React.createElement(Line, _extends({ line: row.data, data: row }, { conf: conf })));
        }
      }
      return ls;
    }
  }]);

  return ChartComponent;
}(React.Component);

exports.default = ChartComponent;

var YLabelContainer = function () {
  function YLabelContainer() {
    _classCallCheck(this, YLabelContainer);
  }

  _createClass(YLabelContainer, [{
    key: 'render',
    value: function render() {
      var _props$conf2 = this.props.conf,
          w = _props$conf2.w,
          h = _props$conf2.h,
          yLabelWidth = _props$conf2.yLabelWidth,
          yMax = _props$conf2.yMax,
          yLabelStep = _props$conf2.yLabelStep;


      return React.createElement(
        'div',
        { className: 'ps-chart ps-y-label-container', style: {
            top: 0,
            left: 0
          } },
        this.labels
      );
    }
  }, {
    key: 'labels',
    get: function get() {
      var conf = this.props.conf;
      var _props$conf3 = this.props.conf,
          w = _props$conf3.w,
          h = _props$conf3.h,
          yLabelWidth = _props$conf3.yLabelWidth,
          yMax = _props$conf3.yMax,
          yLabelStep = _props$conf3.yLabelStep;

      var ls = [];
      var l = Math.round(yMax / yLabelStep);
      var yStep = h / (yMax / yLabelStep);
      for (var i = 0; i <= l; i++) {
        ls.push(React.createElement(YLabel, {
          conf: conf,
          label: i * yLabelStep,
          top: h - yStep * i
        }));
      }

      return ls;
    }
  }]);

  return YLabelContainer;
}();

var XLabelContainer = function (_React$Component2) {
  _inherits(XLabelContainer, _React$Component2);

  function XLabelContainer() {
    _classCallCheck(this, XLabelContainer);

    return _possibleConstructorReturn(this, (XLabelContainer.__proto__ || Object.getPrototypeOf(XLabelContainer)).apply(this, arguments));
  }

  _createClass(XLabelContainer, [{
    key: 'render',
    value: function render() {
      var _props$conf4 = this.props.conf,
          w = _props$conf4.w,
          h = _props$conf4.h,
          yLabelWidth = _props$conf4.yLabelWidth,
          yMax = _props$conf4.yMax,
          yLabelStep = _props$conf4.yLabelStep,
          xLabelHeight = _props$conf4.xLabelHeight;


      return React.createElement(
        'div',
        { className: 'ps-chart ps-x-label-container', style: {
            top: h,
            left: yLabelWidth,
            width: w,
            height: xLabelHeight
          } },
        this.labels
      );
    }
  }, {
    key: 'labels',
    get: function get() {
      var conf = this.props.conf;
      var _props$conf5 = this.props.conf,
          w = _props$conf5.w,
          h = _props$conf5.h,
          yLabelWidth = _props$conf5.yLabelWidth,
          yMax = _props$conf5.yMax,
          yLabelStep = _props$conf5.yLabelStep,
          xSize = _props$conf5.xSize,
          xLabelFormat = _props$conf5.xLabelFormat;

      var ls = [];
      var l = Math.round(yMax / yLabelStep);
      var xStep = w / (xSize - 1);
      for (var i = 0; i < xSize; i++) {
        var xl = this.props.labels[i] || 0;
        ls.push(React.createElement(XLabel, {
          conf: conf,
          label: xLabelFormat ? xLabelFormat(xl) : xl,
          left: xStep * i,
          top: 0
        }));
      }

      return ls;
    }
  }]);

  return XLabelContainer;
}(React.Component);

var YLabel = function () {
  function YLabel() {
    _classCallCheck(this, YLabel);
  }

  _createClass(YLabel, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          top = _props.top,
          label = _props.label;
      var _props$conf6 = this.props.conf,
          yLabelWidth = _props$conf6.yLabelWidth,
          yLabelFormat = _props$conf6.yLabelFormat;


      return React.createElement(
        'div',
        { className: 'ps-chart ps-y-label', style: {
            top: top,
            width: yLabelWidth
          } },
        yLabelFormat ? yLabelFormat(label) : label
      );
    }
  }]);

  return YLabel;
}();

var XLabel = function (_React$Component3) {
  _inherits(XLabel, _React$Component3);

  function XLabel() {
    _classCallCheck(this, XLabel);

    return _possibleConstructorReturn(this, (XLabel.__proto__ || Object.getPrototypeOf(XLabel)).apply(this, arguments));
  }

  _createClass(XLabel, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.reset();
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _this5 = this;

      if (this.props.centering) {
        setTimeout(function () {
          _this5.setState({
            offset: -_this5.innerLabel.clientWidth / 2
          });
        }, 0);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this6 = this;

      var _props2 = this.props,
          left = _props2.left,
          label = _props2.label;

      return React.createElement(
        'div',
        { className: 'ps-chart ps-x-label', style: {
            left: left,
            transform: 'rotateZ(' + (this.props.conf.xLabelRotate || 0) + 'deg)'
          } },
        React.createElement(
          'div',
          { className: 'ps-chart ps-x-label-inner', ref: function ref(l) {
              return _this6.innerLabel = l;
            }, style: { left: this.state.offset } },
          label
        )
      );
    }
  }]);

  return XLabel;
}(React.Component);

var Box = function () {
  function Box() {
    _classCallCheck(this, Box);
  }

  _createClass(Box, [{
    key: 'render',
    value: function render() {
      var conf = this.props.conf;
      var w = conf.w,
          h = conf.h,
          yLabelWidth = conf.yLabelWidth,
          xLabelHeight = conf.xLabelHeight;

      var width = w;
      var height = h;
      var viewBox = '0 0 ' + w + ' ' + h;
      return React.createElement(
        'svg',
        _extends({
          className: 'ps-chart ps-line-box',
          style: { top: 0, left: yLabelWidth, width: width, height: height },
          x: '0px',
          y: '0px'
        }, { viewBox: viewBox }),
        React.createElement(BoxBG, { conf: conf }),
        this.props.children
      );
    }
  }]);

  return Box;
}();

var BoxBG = function (_React$Component4) {
  _inherits(BoxBG, _React$Component4);

  function BoxBG() {
    _classCallCheck(this, BoxBG);

    return _possibleConstructorReturn(this, (BoxBG.__proto__ || Object.getPrototypeOf(BoxBG)).apply(this, arguments));
  }

  _createClass(BoxBG, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'g',
        { x: '0px', y: '0px' },
        this.horizontalLines,
        this.verticalLines
      );
    }
  }, {
    key: 'horizontalLines',
    get: function get() {
      var conf = this.props.conf;
      var w = conf.w,
          h = conf.h,
          yLabelWidth = conf.yLabelWidth,
          yMax = conf.yMax,
          yLabelStep = conf.yLabelStep;

      var ls = [];
      var l = Math.round(yMax / yLabelStep);
      var yStep = h / (yMax / yLabelStep);
      for (var i = 0; i <= l; i++) {
        var y = yStep * i;
        var a = {
          x1: 0,
          x2: w,
          y1: y,
          y2: y
        };
        ls.push(React.createElement('line', _extends({}, a, { style: 'stroke:#ecf0f1; stroke-width:1;' })));
      }

      return ls;
    }
  }, {
    key: 'verticalLines',
    get: function get() {
      var _props$conf7 = this.props.conf,
          w = _props$conf7.w,
          h = _props$conf7.h,
          yLabelWidth = _props$conf7.yLabelWidth,
          yMax = _props$conf7.yMax,
          yLabelStep = _props$conf7.yLabelStep,
          xSize = _props$conf7.xSize,
          xLabelFormat = _props$conf7.xLabelFormat;

      var ls = [];
      var l = Math.round(yMax / yLabelStep);
      var xStep = w / (xSize - 1);

      for (var i = 0; i < xSize; i++) {
        var x = xStep * i;
        var a = {
          x1: x,
          x2: x,
          y1: 0,
          y2: h
        };
        ls.push(React.createElement('line', _extends({}, a, { style: 'stroke:#ecf0f1; stroke-width:1', 'stroke-dasharray': '2, 4' })));
      }

      return ls;
    }
  }]);

  return BoxBG;
}(React.Component);

// y 位置は高さから逆算


var Line = function () {
  function Line() {
    _classCallCheck(this, Line);
  }

  _createClass(Line, [{
    key: 'computeX',
    value: function computeX(position, length) {
      var w = this.props.conf.w;


      return w / (length - 1) * position;
    }
  }, {
    key: 'computeY',
    value: function computeY(value) {
      var _props$conf8 = this.props.conf,
          h = _props$conf8.h,
          yMax = _props$conf8.yMax;


      return h - h * (value / yMax);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var line = this.props.line;


      var onMouseOver = function onMouseOver(e) {
        _this8.props.conf.innerHub.emit('line:over', {
          name: _this8.props.data.name,
          color: _this8.state.color,
          e: e
        });
      };

      var pre = void 0;
      var l = line.length;

      return React.createElement(
        'g',
        _extends({ id: this.props.data.name + this.props.data.id }, { onMouseOver: onMouseOver }, { key: this.props.data.name }),
        line.map(function (d, i) {

          var now = {
            x1: pre ? pre.x : 0,
            y1: pre ? pre.y : 0,
            x2: _this8.computeX(i, l),
            y2: _this8.computeY(d)
          };

          var re = pre ? React.createElement('line', _extends({}, now, { style: 'stroke:' + _this8.props.data.color + ';stroke-width:1' })) : null;

          pre = { x: now.x2, y: now.y2 };
          return re;
        })
      );
    }
  }]);

  return Line;
}();

},{"../index":2,"../models/chart-data":3,"../utils/hub":6,"events":7,"preact":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configure = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require('preact');

var _chart = require('./components/chart');

var _chart2 = _interopRequireDefault(_chart);

var _events = require('events');

var _colorWheel = require('./utils/color-wheel');

var _hub = require('./utils/hub');

var _hub2 = _interopRequireDefault(_hub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var c3 = window.c3;
var req = window.superagent;

var React = { Component: _preact.Component, cloneElement: _preact.cloneElement, createElement: _preact.h };

var Configure = exports.Configure = function () {
  function Configure() {
    _classCallCheck(this, Configure);
  }

  _createClass(Configure, null, [{
    key: 'size',
    set: function set(v) {
      this._dataArray = [];
      for (var i = v; i--;) {
        this._dataArray.push(0);
      }
      this._size = v;
    },
    get: function get() {
      return this._size;
    }
  }, {
    key: 'dataArray',
    get: function get() {
      return this._dataArray.concat();
    }
  }]);

  return Configure;
}();

var Watcher = function () {
  function Watcher(_ref) {
    var size = _ref.size,
        wait = _ref.wait,
        tasks = _ref.tasks,
        totalCPU = _ref.totalCPU,
        totalMemory = _ref.totalMemory,
        CPUGraph = _ref.CPUGraph,
        memoryGraph = _ref.memoryGraph,
        initialData = _ref.initialData,
        names = _ref.names,
        realNames = _ref.realNames,
        min = _ref.min;

    _classCallCheck(this, Watcher);

    this.conf = {
      tasks: tasks,
      totalCPU: totalCPU,
      totalMemory: totalMemory,
      CPUGraph: CPUGraph,
      memoryGraph: memoryGraph,
      initialData: initialData,
      names: names,
      realNames: realNames,
      min: min
    };

    Configure.wait = wait;
    Configure.size = size;
    Configure.min = min;
    Configure.keyMap = {};
    realNames.forEach(function (n, i) {
      Configure.keyMap[n] = i;
    });

    this.store = new DataStore();
  }

  _createClass(Watcher, [{
    key: 'start',
    value: function start() {
      this.initialize();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      var keyMap = Configure.keyMap;


      this.timeList = [];
      var processList = {};
      var memoryList = {
        1: { id: 1, color: '#bdc3c7', name: 'free', data: [] },
        2: { id: 2, color: '#e74c3c', name: 'used', data: [] },
        3: { id: 3, color: '#9b59b6', name: 'buffers', data: [] }
      };

      var CPUList = {
        1: { id: 1, color: '#e74c3c', name: 'User', data: [] },
        2: { id: 2, color: '#3498db', name: 'System', data: [] },
        3: { id: 3, color: '#1abc9c', name: 'Nice', data: [] },
        4: { id: 4, color: '#bdc3c7', name: 'Idle', data: [] },
        5: { id: 5, name: 'IOWait', data: [] },
        6: { id: 6, name: 'HardwareInterrupt', data: [] },
        7: { id: 7, name: 'SoftwareInterrupt', data: [] },
        8: { id: 8, name: 'StolenTime', data: [] }
      };

      this.conf.initialData.forEach(function (_ref2, i) {
        var memory = _ref2.memory,
            cpu = _ref2.cpu,
            time = _ref2.time,
            processes = _ref2.processes,
            rowPositions = _ref2.rowPositions;

        // manage time
        _this.timeList.push(time * 1000 + '');

        var Total = memory.Total,
            Used = memory.Used,
            Free = memory.Free,
            Buffers = memory.Buffers;


        _this.totalMemory = +Total;
        memoryList[1].data.push(Math.round(+Free / _this.totalMemory * 1000) / 10);
        memoryList[2].data.push(Math.round(+Used / _this.totalMemory * 1000) / 10);
        memoryList[3].data.push(Math.round(+Buffers / _this.totalMemory * 1000) / 10);

        var User = cpu.User,
            System = cpu.System,
            Nice = cpu.Nice,
            Idle = cpu.Idle,
            IOWait = cpu.IOWait,
            HardwareInterrupt = cpu.HardwareInterrupt,
            SoftwareInterrupt = cpu.SoftwareInterrupt,
            StolenTime = cpu.StolenTime;


        CPUList[1].data.push(User);
        CPUList[2].data.push(System);
        CPUList[3].data.push(Nice);
        CPUList[4].data.push(Idle);
        CPUList[5].data.push(IOWait);
        CPUList[6].data.push(HardwareInterrupt);
        CPUList[7].data.push(SoftwareInterrupt);
        CPUList[8].data.push(StolenTime);

        if (!processes) {
          return {};
        }

        // manage processes
        processes.forEach(function (process) {
          var pid = process[rowPositions.PID];
          var cmd = process[rowPositions.COMMAND];
          if (cmd.indexOf('/top') != -1 || cmd === 'top') {
            return;
          }

          var pidQueue = processList[pid] ? processList[pid] : processList[pid] = {
            pid: pid,
            cmd: cmd,
            rowPositions: rowPositions,
            data: Configure.dataArray
          };

          pidQueue.data[i] = { process: process };
        });
      });

      (0, _preact.render)(React.createElement(_chart2.default, {
        name: 'totalCPU',
        data: CPUList,
        xLabels: this.timeList,
        conf: {
          stack: true,
          w: 400,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 20,
          yLabelFormat: function yLabelFormat(v) {
            return v + ' %';
          },
          xLabelFormat: function xLabelFormat(v) {
            return dateString(v);
          }
        } }), document.querySelector('#' + this.conf.totalCPU));

      (0, _preact.render)(React.createElement(_chart2.default, {
        name: 'totalMemory',
        data: memoryList,
        xLabels: this.timeList,
        conf: {
          stack: true,
          w: 400,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 20,
          yLabelFormat: function yLabelFormat(v) {
            return v + ' %';
          },
          xLabelFormat: function xLabelFormat(v) {
            return dateString(v);
          }
        } }), document.querySelector('#' + this.conf.totalMemory));

      (0, _preact.render)(React.createElement(_chart2.default, {
        name: 'PerCPU',
        data: pickRow('%CPU', processList),
        xLabels: this.timeList,
        conf: {
          w: 400,
          h: 300,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 200,
          yLabelStep: 20,
          yLabelFormat: function yLabelFormat(v) {
            return v + ' %';
          },
          xLabelFormat: function xLabelFormat(v) {
            return dateString(v);
          }
        } }), document.querySelector('#' + this.conf.CPUGraph));

      (0, _preact.render)(React.createElement(_chart2.default, {
        name: 'PerMemory',
        data: pickRow('%MEM', processList),
        xLabels: this.timeList,
        conf: {
          stack: true,
          w: 400,
          h: 600,
          xLabelHeight: 70,
          xSize: Configure.size,
          xLabelRotate: 90,
          yLabelWidth: 50,
          yMax: 100,
          yLabelStep: 5,
          yLabelFormat: function yLabelFormat(v) {
            return v + ' %';
          },
          xLabelFormat: function xLabelFormat(v) {
            return dateString(v);
          }
        } }), document.querySelector('#' + this.conf.memoryGraph));

      setInterval(function () {
        req.get('/r').set('Accept', 'application/json').end(function (err, res) {
          var _res$body = res.body,
              processes = _res$body.processes,
              rowPositions = _res$body.rowPositions,
              time = _res$body.time,
              cpu = _res$body.cpu,
              memory = _res$body.memory;

          time *= 1000;
          var picked = pick(processes, rowPositions.PID, rowPositions.COMMAND, [rowPositions['%CPU'], rowPositions['%MEM']]);
          _hub2.default.emit('PerCPU', {
            type: 'add', data: picked[rowPositions['%CPU']],
            xLabel: time
          });
          _hub2.default.emit('PerMemory', {
            type: 'add', data: picked[rowPositions['%MEM']],
            xLabel: time
          });

          var memoryList = {
            1: { id: 1, color: '#bdc3c7', name: 'free', value: Math.round(memory.Free / _this.totalMemory * 1000) / 10 },
            2: { id: 2, color: '#e74c3c', name: 'used', value: Math.round(memory.Used / _this.totalMemory * 1000) / 10 },
            3: { id: 3, color: '#9b59b6', name: 'buffers', value: Math.round(memory.Buffers / _this.totalMemory * 1000) / 10 }
          };

          _hub2.default.emit('totalMemory', {
            type: 'add', data: memoryList,
            xLabel: time
          });

          var CPUList = {
            1: { id: 1, name: 'User', value: cpu.User },
            2: { id: 2, name: 'System', value: cpu.System },
            3: { id: 3, name: 'Nice', value: cpu.Nice },
            4: { id: 4, name: 'Idle', value: cpu.Idle },
            5: { id: 5, name: 'IOWait', value: cpu.IOWait },
            6: {
              id: 6,
              name: 'HardwareInterrupt',
              value: cpu.HardwareInterrupt
            },
            7: {
              id: 7,
              name: 'SoftwareInterrupt',
              value: cpu.SoftwareInterrupt
            },
            8: { id: 8, name: 'StolenTime', value: cpu.StolenTime }
          };

          _hub2.default.emit('totalCPU', {
            type: 'add', data: CPUList,
            xLabel: time
          });
        });
      }, Configure.wait * 1000);
    }
  }]);

  return Watcher;
}();

function pickRow(rowName, processList) {
  var re = {};

  var _loop = function _loop(i) {
    var now = processList[i];
    if (now.cmd.indexOf('top') !== -1) {
      return 'continue';
    }
    var pos = now.rowPositions[rowName];
    re[i] = {
      id: +now.pid,
      name: now.cmd,
      data: now.data.map(function (d) {
        return d.process ? +d.process[pos] : 0;
      })
    };
  };

  for (var i in processList) {
    var _ret = _loop(i);

    if (_ret === 'continue') continue;
  }
  return re;
}

function dateString(unixTime) {
  var d = new Date(+unixTime);
  return double(d.getHours()) + ':' + double(d.getMinutes()) + ':' + double(d.getSeconds());
}

function double(n) {
  return (n < 10 ? '0' : '') + n;
}

function pick(processes, idPosition, namePosition, valuePositions) {
  var re = {};
  processes.forEach(function (process) {
    valuePositions.forEach(function (valuePosition) {
      if (!re[valuePosition]) {
        re[valuePosition] = {};
      }
      var id = process[idPosition];
      if (process[namePosition].indexOf('top') !== -1) {
        return;
      }
      re[valuePosition][id] = {
        id: +process[idPosition],
        name: process[namePosition],
        value: +process[valuePosition]
      };
    });
  });
  return re;
}

var DataStore = function () {
  function DataStore() {
    _classCallCheck(this, DataStore);

    this.store = {};
  }

  _createClass(DataStore, [{
    key: 'column',
    value: function column(name) {
      var re = {};
      for (var i in this.store) {
        re.push({
          id: +this.store[i].pid,
          name: this.store[i].cmd,
          data: this.store[i].getByName(name)
        });
      }
      return re;
    }
  }, {
    key: 'process',
    value: function process(pid, cmd) {
      if (this.store[pid]) {
        return this.store[pid];
      }

      return this.store[pid] = new DataSet({ pid: pid, cmd: cmd });
    }
  }]);

  return DataStore;
}();

window.Watcher = Watcher;

},{"./components/chart":1,"./utils/color-wheel":5,"./utils/hub":6,"events":7,"preact":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chatRow = require('./chat-row');

var _chatRow2 = _interopRequireDefault(_chatRow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChartData = function () {
  function ChartData(raw, size) {
    var isStack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _classCallCheck(this, ChartData);

    this.data = {};
    this.size = size;
    this.total = 0;
    this.stack = [];
    this.isStack = isStack;

    for (var k in raw) {
      var row = new _chatRow2.default(raw[k]);
      if (row.total !== 0) {
        this.data[k] = row;
      }
    }

    if (!this.isStack) {
      return;
    }

    for (var _k in this.data) {
      this.data[_k].prepareStack();
    }

    for (var i = size; i--;) {
      var pre = 0;
      for (var _k2 in this.data) {
        var now = this.data[_k2];
        now.setInStack(i, pre + now.data[i]);
        pre = now.stack[i];
      }
    }
  }

  _createClass(ChartData, [{
    key: 'removeRow',
    value: function removeRow(row) {
      delete this.data[row.id];
    }
  }, {
    key: 'add',
    value: function add(newData) {
      var pre = 0;

      // 既存の row に反映
      for (var k in this.data) {
        var row = this.data[k];

        var next = void 0;
        if (newData[row.id]) {
          next = newData[row.id].value;
          delete newData[row.id];
        } else {
          next = 0;
        }
        pre += next;
        row.shiftAndPush(next, pre);

        row.removable && this.removeRow(row);
      }

      // 新しい row を追加
      for (var i in newData) {
        var _newData$i = newData[i],
            id = _newData$i.id,
            name = _newData$i.name,
            value = _newData$i.value;

        var data = [];
        for (var _i = this.size - 1; _i--;) {
          data[_i] = 0;
        }
        data.push(value);

        var _row = new _chatRow2.default({ id: id, name: name, data: data });

        if (_row.total === 0) {
          continue;
        }

        if (this.isStack) {
          var previousLine = void 0;
          for (var ii = id; ii--;) {
            if (this.data[ii]) {
              previousLine = this.data[ii];
              break;
            }
          }

          _row.copyStackFrom(previousLine);
          _row.stack[data.length - 1] += value;
        }

        this.data[id] = _row;
      }
    }
  }]);

  return ChartData;
}();

exports.default = ChartData;

},{"./chat-row":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _colorWheel = require('../utils/color-wheel');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChartRow = function () {
  function ChartRow(_ref) {
    var id = _ref.id,
        name = _ref.name,
        data = _ref.data,
        color = _ref.color;

    _classCallCheck(this, ChartRow);

    this.id = id;
    this.name = name || '';
    this.data = data || [];
    this.stack = [];
    this.total = this.data.reduce(function (a, n) {
      return a + Math.floor(n * 10);
    }, 0);

    this.color = color || (0, _colorWheel.numToColor)(this.id);
  }

  _createClass(ChartRow, [{
    key: 'copyStackFrom',
    value: function copyStackFrom(previousLine) {
      this.stack = (previousLine ? previousLine.stack : this.data).map(function (d) {
        return d;
      });
    }
  }, {
    key: 'shiftAndPush',
    value: function shiftAndPush(value, stackValue) {

      var remove = this.data.shift();
      this.total += Math.floor(value * 10) - Math.floor(remove * 10);
      this.data.push(value);

      this.stack.shift();
      this.stack.push(stackValue);
    }
  }, {
    key: 'prepareStack',
    value: function prepareStack() {
      this.stack = this.data.concat();
    }
  }, {
    key: 'setInStack',
    value: function setInStack(i, v) {
      this.stack[i] = v;
    }
  }, {
    key: 'removable',
    get: function get() {
      return this.total <= 0;
    }
  }]);

  return ChartRow;
}();

exports.default = ChartRow;

},{"../utils/color-wheel":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textToColor = textToColor;
exports.numToColor = numToColor;
var colors = exports.colors = ['#0086AB', '#0098A6', '#00A199', '#009C7F', '#009767', '#009250', '#059C30', '#0BA60B', '#3BB111', '#6FBB18', '#A4C520', '#B6D11B', '#CBDC15', '#E4E80F', '#F3EB08', '#FFE600', '#FBDA02', '#F8CF05', '#F4C107', '#F1B709', '#EDAD0B', '#E58611', '#DE6316', '#D6431B', '#CF2620', '#C7243A', '#C42245', '#C01F52', '#BD1D5D', '#B91B67', '#B61972', '#AF1C74', '#A81F76', '#A12275', '#9A2475', '#932674', '#953095', '#7F3B97', '#6C469A', '#5F519C', '#5D639E', '#4D5FA3', '#3B60A8', '#2962AD', '#156BB2', '#007AB7', '#007CB5', '#0080B2', '#0081B0', '#0085AD'];
var colorLength = colors.length;

function textToColor(s) {
  return colors[(s.charCodeAt(1) + s.charCodeAt(2)) % colorLength];
}

function numToColor(n) {
  return colors[n % colorLength];
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

exports.default = new _events.EventEmitter();

},{"events":7}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
!function(global, factory) {
    'object' == typeof exports && 'undefined' != typeof module ? factory(exports) : 'function' == typeof define && define.amd ? define([ 'exports' ], factory) : factory(global.preact = global.preact || {});
}(this, function(exports) {
    function VNode(nodeName, attributes, children) {
        this.nodeName = nodeName;
        this.attributes = attributes;
        this.children = children;
        this.key = attributes && attributes.key;
    }
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = [];
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) instanceof Array) for (i = child.length; i--; ) stack.push(child[i]); else if (null != child && child !== !1) {
            if ('number' == typeof child || child === !0) child = String(child);
            simple = 'string' == typeof child;
            if (simple && lastSimple) children[children.length - 1] += child; else {
                children.push(child);
                lastSimple = simple;
            }
        }
        var p = new VNode(nodeName, attributes || void 0, children);
        if (options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        if (props) for (var i in props) obj[i] = props[i];
        return obj;
    }
    function clone(obj) {
        return extend({}, obj);
    }
    function delve(obj, key) {
        for (var p = key.split('.'), i = 0; i < p.length && obj; i++) obj = obj[p[i]];
        return obj;
    }
    function isFunction(obj) {
        return 'function' == typeof obj;
    }
    function isString(obj) {
        return 'string' == typeof obj;
    }
    function hashToClassName(c) {
        var str = '';
        for (var prop in c) if (c[prop]) {
            if (str) str += ' ';
            str += prop;
        }
        return str;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(clone(vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function createLinkedState(component, key, eventPath) {
        var path = key.split('.');
        return function(e) {
            var t = e && e.target || this, state = {}, obj = state, v = isString(eventPath) ? delve(e, eventPath) : t.nodeName ? t.type.match(/^che|rad/) ? t.checked : t.value : e, i = 0;
            for (;i < path.length - 1; i++) obj = obj[path[i]] || (obj[path[i]] = !i && component.state[path[i]] || {});
            obj[path[i]] = v;
            component.setState(state);
        };
    }
    function enqueueRender(component) {
        if (!component._dirty && (component._dirty = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p._dirty) renderComponent(p);
    }
    function isFunctionalComponent(vnode) {
        var nodeName = vnode && vnode.nodeName;
        return nodeName && isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render);
    }
    function buildFunctionalComponent(vnode, context) {
        return vnode.nodeName(getNodeProps(vnode), context || EMPTY);
    }
    function isSameNodeType(node, vnode) {
        if (isString(vnode)) return node instanceof Text;
        if (isString(vnode.nodeName)) return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
        if (isFunction(vnode.nodeName)) return (node._componentConstructor ? node._componentConstructor === vnode.nodeName : !0) || isFunctionalComponent(vnode); else ;
    }
    function isNamedNode(node, nodeName) {
        return node.normalizedNodeName === nodeName || toLowerCase(node.nodeName) === toLowerCase(nodeName);
    }
    function getNodeProps(vnode) {
        var props = clone(vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function removeNode(node) {
        var p = node.parentNode;
        if (p) p.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('class' === name && value && 'object' == typeof value) value = hashToClassName(value);
        if ('key' === name) ; else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || isString(value) || isString(old)) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if (!isString(old)) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !NON_DIMENSION_PROPS[i] ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) node.innerHTML = value && value.__html || ''; else if ('o' == name[0] && 'n' == name[1]) {
            var l = node._listeners || (node._listeners = {});
            name = toLowerCase(name.substring(2));
            if (value) {
                if (!l[name]) node.addEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
            } else if (l[name]) node.removeEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
            l[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || value === !1) node.removeAttribute(name);
        } else {
            var ns = isSvg && name.match(/^xlink\:?(.+)/);
            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1])); else node.removeAttribute(name); else if ('object' != typeof value && !isFunction(value)) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this._listeners[e.type](options.event && options.event(e) || e);
    }
    function collectNode(node) {
        removeNode(node);
        if (node instanceof Element) {
            node._component = node._componentConstructor = null;
            var _name = node.normalizedNodeName || toLowerCase(node.nodeName);
            (nodes[_name] || (nodes[_name] = [])).push(node);
        }
    }
    function createNode(nodeName, isSvg) {
        var name = toLowerCase(nodeName), node = nodes[name] && nodes[name].pop() || (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName));
        node.normalizedNodeName = name;
        return node;
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = parent instanceof SVGElement;
            hydrating = dom && !(ATTR_KEY in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll) {
        var originalAttributes = vnode && vnode.attributes;
        while (isFunctionalComponent(vnode)) vnode = buildFunctionalComponent(vnode, context);
        if (null == vnode) vnode = '';
        if (isString(vnode)) {
            if (dom && dom instanceof Text) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                if (dom) recollectNodeTree(dom);
                dom = document.createTextNode(vnode);
            }
            dom[ATTR_KEY] = !0;
            return dom;
        }
        if (isFunction(vnode.nodeName)) return buildComponentFromVNode(dom, vnode, context, mountAll);
        var out = dom, nodeName = String(vnode.nodeName), prevSvgMode = isSvgMode, vchildren = vnode.children;
        isSvgMode = 'svg' === nodeName ? !0 : 'foreignObject' === nodeName ? !1 : isSvgMode;
        if (!dom) out = createNode(nodeName, isSvgMode); else if (!isNamedNode(dom, nodeName)) {
            out = createNode(nodeName, isSvgMode);
            while (dom.firstChild) out.appendChild(dom.firstChild);
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
            recollectNodeTree(dom);
        }
        var fc = out.firstChild, props = out[ATTR_KEY];
        if (!props) {
            out[ATTR_KEY] = props = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        diffAttributes(out, vnode.attributes, props);
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && fc && fc instanceof Text && !fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || fc) innerDiffNode(out, vchildren, context, mountAll);
        if (originalAttributes && 'function' == typeof originalAttributes.ref) (props.ref = originalAttributes.ref)(out);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll) {
        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren && vchildren.length;
        if (len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child[ATTR_KEY], key = vlen ? (c = _child._component) ? c.__key : props ? props.key : null : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (hydrating || props) children[childrenLen++] = _child;
        }
        if (vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && key in keyed) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) {
                c = children[j];
                if (c && isSameNodeType(c, vchild)) {
                    child = c;
                    children[j] = void 0;
                    if (j === childrenLen - 1) childrenLen--;
                    if (j === min) min++;
                    break;
                }
            }
            child = idiff(child, vchild, context, mountAll);
            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) {
                if (child === originalChildren[i + 1]) removeNode(originalChildren[i]);
                dom.insertBefore(child, originalChildren[i] || null);
            }
        }
        if (keyedLen) for (var i in keyed) if (keyed[i]) recollectNodeTree(keyed[i]);
        while (min <= childrenLen) {
            child = children[childrenLen--];
            if (child) recollectNodeTree(child);
        }
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component, !unmountOnly); else {
            if (node[ATTR_KEY] && node[ATTR_KEY].ref) node[ATTR_KEY].ref(null);
            if (!unmountOnly) collectNode(node);
            var c;
            while (c = node.lastChild) recollectNodeTree(c, unmountOnly);
        }
    }
    function diffAttributes(dom, attrs, old) {
        for (var _name in old) if (!(attrs && _name in attrs) && null != old[_name]) setAccessor(dom, _name, old[_name], old[_name] = void 0, isSvgMode);
        if (attrs) for (var _name2 in attrs) if (!('children' === _name2 || 'innerHTML' === _name2 || _name2 in old && attrs[_name2] === ('value' === _name2 || 'checked' === _name2 ? dom[_name2] : old[_name2]))) setAccessor(dom, _name2, old[_name2], old[_name2] = attrs[_name2], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name, list = components[name];
        if (list) list.push(component); else components[name] = [ component ];
    }
    function createComponent(Ctor, props, context) {
        var inst = new Ctor(props, context), list = components[Ctor.name];
        Component.call(inst, props, context);
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.nextBase = list[i].nextBase;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component._disable) {
            component._disable = !0;
            if (component.__ref = props.ref) delete props.ref;
            if (component.__key = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.prevContext) component.prevContext = component.context;
                component.context = context;
            }
            if (!component.prevProps) component.prevProps = component.props;
            component.props = props;
            component._disable = !1;
            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__ref) component.__ref(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component._disable) {
            var skip, rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.prevProps || props, previousState = component.prevState || state, previousContext = component.prevContext || context, isUpdate = component.base, nextBase = component.nextBase, initialBase = isUpdate || nextBase, initialChildComponent = component._component;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
            component._dirty = !1;
            if (!skip) {
                if (component.render) rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(clone(context), component.getChildContext());
                while (isFunctionalComponent(rendered)) rendered = buildFunctionalComponent(rendered, context);
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if (isFunction(childComponent)) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__key) setComponentProps(inst, childProps, 1, context); else {
                        toUnmount = inst;
                        inst = createComponent(childComponent, childProps, context);
                        inst.nextBase = inst.nextBase || nextBase;
                        inst._parentComponent = component;
                        component._component = inst;
                        setComponentProps(inst, childProps, 0, context);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount, base !== initialBase);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t._parentComponent) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            var fn, cb = component._renderCallbacks;
            if (cb) while (fn = cb.pop()) fn.call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c._parentComponent)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (c && !isDirectOwner) {
                unmountComponent(c, !0);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.nextBase) {
                c.nextBase = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom);
            }
        }
        return dom;
    }
    function unmountComponent(component, remove) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component._disable = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner, remove); else if (base) {
            if (base[ATTR_KEY] && base[ATTR_KEY].ref) base[ATTR_KEY].ref(null);
            component.nextBase = base;
            if (remove) {
                removeNode(base);
                collectComponent(component);
            }
            var c;
            while (c = base.lastChild) recollectNodeTree(c, !remove);
        }
        if (component.__ref) component.__ref(null);
        if (component.componentDidUnmount) component.componentDidUnmount();
    }
    function Component(props, context) {
        this._dirty = !0;
        this.context = context;
        this.props = props;
        if (!this.state) this.state = {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent);
    }
    var options = {};
    var stack = [];
    var lcCache = {};
    var toLowerCase = function(s) {
        return lcCache[s] || (lcCache[s] = s.toLowerCase());
    };
    var resolved = 'undefined' != typeof Promise && Promise.resolve();
    var defer = resolved ? function(f) {
        resolved.then(f);
    } : setTimeout;
    var EMPTY = {};
    var ATTR_KEY = 'undefined' != typeof Symbol ? Symbol.for('preactattr') : '__preactattr_';
    var NON_DIMENSION_PROPS = {
        boxFlex: 1,
        boxFlexGroup: 1,
        columnCount: 1,
        fillOpacity: 1,
        flex: 1,
        flexGrow: 1,
        flexPositive: 1,
        flexShrink: 1,
        flexNegative: 1,
        fontWeight: 1,
        lineClamp: 1,
        lineHeight: 1,
        opacity: 1,
        order: 1,
        orphans: 1,
        strokeOpacity: 1,
        widows: 1,
        zIndex: 1,
        zoom: 1
    };
    var NON_BUBBLING_EVENTS = {
        blur: 1,
        error: 1,
        focus: 1,
        load: 1,
        resize: 1,
        scroll: 1
    };
    var items = [];
    var nodes = {};
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        linkState: function(key, eventPath) {
            var c = this._linkedStates || (this._linkedStates = {});
            return c[key + eventPath] || (c[key + eventPath] = createLinkedState(this, key, eventPath));
        },
        setState: function(state, callback) {
            var s = this.state;
            if (!this.prevState) this.prevState = clone(s);
            extend(s, isFunction(state) ? state(s, this.props) : state);
            if (callback) (this._renderCallbacks = this._renderCallbacks || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function() {
            renderComponent(this, 2);
        },
        render: function() {}
    });
    exports.h = h;
    exports.cloneElement = cloneElement;
    exports.Component = Component;
    exports.render = render;
    exports.rerender = rerender;
    exports.options = options;
});

},{}]},{},[2]);
