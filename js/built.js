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
        realNames = _ref.realNames;

    _classCallCheck(this, Watcher);

    this.conf = {
      tasks: tasks,
      totalCPU: totalCPU,
      totalMemory: totalMemory,
      CPUGraph: CPUGraph,
      memoryGraph: memoryGraph,
      initialData: initialData,
      names: names,
      realNames: realNames
    };

    Configure.wait = wait;
    Configure.size = size;
    Configure.keyMap = {};
    realNames.forEach(function (n, i) {
      Configure.keyMap[n] = i;
    });
  }

  _createClass(Watcher, [{
    key: 'start',
    value: function start() {
      this.initialize();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var keyMap = Configure.keyMap;


      var store = new DataStore();

      this.conf.initialData.forEach(function (_ref2, i) {
        var processes = _ref2.processes;

        if (!processes) {
          return {};
        }
        processes.forEach(function (process) {
          var pid = process[keyMap.PID];
          var cmd = process[keyMap.Command];
          if (cmd.indexOf('/top') != -1 || cmd === 'top') {
            return;
          }

          store.process(pid, cmd).addInto(process, i);
        });
      });

      new Chart({
        id: this.conf.CPUGraph,
        dataList: store.column('PerCPU')
      });
    }
  }, {
    key: 'loop',
    value: function loop() {
      setInterval(function () {
        req.get('/r').set('Accept', 'application/json').end(function (err, res) {
          console.log(res);
        });
      }, this.conf.wait * 1000);
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
      var _this = this;

      process.forEach(function (v, i) {
        _this.store[i].push(v);
      });
    }
  }, {
    key: 'addInto',
    value: function addInto(process, position) {
      var _this2 = this;

      process.forEach(function (v, i) {
        _this2.store[i][position] = v;
      });
    }
  }]);

  return DataSet;
}();

var Chart = function Chart(_ref4) {
  var id = _ref4.id,
      dataList = _ref4.dataList;

  _classCallCheck(this, Chart);

  console.log(dataList);
  var columns = dataList;
  for (var i in dataList) {
    columns.push(dataList[i]);
  }

  this.chart = c3.generate({
    bindto: '#' + id,
    size: {
      height: 800
    },
    data: {
      columns: columns
    },
    axis: {
      x: {
        type: 'category',
        categories: [],
        tick: {
          rotate: 90,
          multiline: false
        },
        height: 100
      }
    },
    point: {
      show: false
    },
    transition: {
      duration: 0
    }
  });
};

window.Watcher = Watcher;

},{}]},{},[1]);
