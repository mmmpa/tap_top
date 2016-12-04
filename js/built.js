(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var c3 = window.c3;
var req = window.superagent;

var Configure = function () {
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

      this.conf.initialData.forEach(function (_ref2, i) {
        var time = _ref2.time,
            processes = _ref2.processes,
            rowPositions = _ref2.rowPositions;

        console.log(rowPositions);
        _this.timeList.push(time * 1000 + '');

        if (!processes) {
          return {};
        }
        processes.forEach(function (process) {
          var pid = process[rowPositions.PID];
          var cmd = process[rowPositions.COMMAND];
          if (cmd.indexOf('/top') != -1 || cmd === 'top') {
            return;
          }

          _this.store.process(pid, cmd).addInto(process, i);
        });
      });

      this.cpuChart = new Chart({
        id: this.conf.CPUGraph,
        dataList: this.store.column('PerCPU'),
        timeList: this.timeList.concat()
      });

      this.memoryChart = new Chart({
        id: this.conf.memoryGraph,
        dataList: this.store.column('PerMemory'),
        timeList: this.timeList.concat()
      }).stack();
      this.work();
    }
  }, {
    key: 'work',
    value: function work() {
      var _this2 = this;

      setInterval(function () {
        req.get('/r').set('Accept', 'application/json').end(function (err, res) {
          var _res$body = res.body,
              processes = _res$body.processes,
              rowPositions = _res$body.rowPositions;


          setTimeout(function () {
            _this2.cpuChart.add(processes, rowPositions.PID, rowPositions.COMMAND, rowPositions['%CPU']);
            _this2.cpuChart.shiftTime(_this2.timeList.concat());
          }, 1);
          setTimeout(function () {
            _this2.memoryChart.add(processes, rowPositions.PID, rowPositions.COMMAND, rowPositions['%MEM']);
            _this2.memoryChart.shiftTime(_this2.timeList.concat());
          }, 2);
        });
      }, Configure.wait * 1000);
    }
  }]);

  return Watcher;
}();

var DataStore = function () {
  function DataStore() {
    _classCallCheck(this, DataStore);

    this.store = {};
  }

  _createClass(DataStore, [{
    key: 'column',
    value: function column(name) {
      var re = [];
      for (var i in this.store) {
        re.push([this.store[i].pid + ':' + this.store[i].cmd].concat(this.store[i].getByName(name)));
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
  }, {
    key: 'add',
    value: function add(processes) {
      var _this3 = this;

      var keyMap = Configure.keyMap;


      processes.forEach(function (process) {
        var pid = process[keyMap.PID];
        var cmd = process[keyMap.Command];
        if (cmd.indexOf('/top') != -1 || cmd === 'top') {
          return;
        }

        _this3.process(pid, cmd).add(process);
      });
    }
  }]);

  return DataStore;
}();

var DataSet = function () {
  function DataSet(_ref3) {
    var pid = _ref3.pid,
        cmd = _ref3.cmd;

    _classCallCheck(this, DataSet);

    this.pid = pid;
    this.cmd = cmd;
    this.store = [];
    this.total = 0;

    // 持ちうる key の分だけ配列を用意する
    for (var i in Configure.keyMap) {
      this.store.push(Configure.dataArray);
    }
  }

  _createClass(DataSet, [{
    key: 'getByName',
    value: function getByName(name) {
      return this.store[Configure.keyMap[name]];
    }
  }, {
    key: 'add',
    value: function add(process) {
      var _this4 = this;

      process.forEach(function (v, i) {
        _this4.store[i].shift();
        _this4.store[i].push(v);
      });
    }

    // プロセスの各値が入った配列が引数となるので、
    // それを y 軸上に配置する

  }, {
    key: 'addInto',
    value: function addInto(process, position) {
      var _this5 = this;

      process.forEach(function (v, i) {
        var n = +v;
        if (n < Configure.min) {
          n = 0;
        }
        _this5.store[i][position] = n;
        if (!isNaN(n)) {
          _this5.total += n;
        }
      });
    }
  }]);

  return DataSet;
}();

var Chart = function () {
  function Chart(_ref4) {
    var id = _ref4.id,
        dataList = _ref4.dataList,
        timeList = _ref4.timeList;

    _classCallCheck(this, Chart);

    var columns = dataList;
    timeList.unshift('x');
    // columns.push(timeList)

    this.chart = c3.generate({
      bindto: '#' + id,
      size: {
        height: 800
      },
      data: {
        columns: columns
      },
      legend: {
        show: false
      },
      tooltip: {
        grouped: false
      },
      axis: {
        x: {
          show: false
        },
        y: {
          max: 100,
          tick: {
            format: function format(d) {
              if (d > 100) {
                return '';
              }
              return d + ' %';
            }
          }
        }
      },
      point: {
        show: false
      },
      transition: {
        duration: 0
      }
    });
  }

  _createClass(Chart, [{
    key: 'shiftTime',
    value: function shiftTime(timeList) {
      // this.chart.x(timeList)
    }
  }, {
    key: 'add',
    value: function add(processes, pidPosition, commandPosition, targetPosition) {
      var _this6 = this;

      var columns = [];
      processes.forEach(function (process) {
        var pid = process[pidPosition];
        var cmd = process[commandPosition];
        var value = process[targetPosition];
        if (cmd.indexOf('/top') != -1 || cmd === 'top') {
          return;
        }

        var cols = _this6.chart.data.values(pid + ':' + cmd);
        if (cols) {
          cols.shift();
          cols.push(value);
          cols.unshift(pid + ':' + cmd);
          columns.push(cols);
        }
      });

      this.chart.load({ columns: columns });
    }
  }, {
    key: 'reload',
    value: function reload(dataList) {
      this.chart.load({
        columns: dataList
      });
    }
  }, {
    key: 'stack',
    value: function stack() {
      this.chart.groups([this.chart.data().map(function (d) {
        return d.id;
      })]);

      return this;
    }
  }]);

  return Chart;
}();

window.Watcher = Watcher;

var d = new Date();
d.getHours();

},{}]},{},[1]);
