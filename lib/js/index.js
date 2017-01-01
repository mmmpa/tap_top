import PrettySimpleChart  from './pretty-simple-chart';

const req = window.superagent;

export class Configure {
  static set size (v) {
    this.pDataArray = [];
    for (let i = v; i--;) {
      this.pDataArray.push(0);
    }
    this.pSize = v;
  }

  static get size () {
    return this.pSize;
  }

  static get dataArray () {
    return this.pDataArray.concat();
  }
}

function pickRow (rowName, processList) {
  const re = {};
  Object.keys(processList).forEach((i) => {
    const now = processList[i];
    if (now.cmd.indexOf('top') !== -1) {
      return;
    }
    const pos = now.rowPositions[rowName];
    re[i] = {
      id: +now.pid,
      name: now.cmd,
      data: now.data.map(d => (d.process ? +d.process[pos] : 0)),
    };
  });
  return re;
}

function double (n) {
  return (n < 10 ? '0' : '') + n;
}

function dateString (unixTime) {
  const d = new Date(+unixTime);
  return `${double(d.getHours())}:${double(d.getMinutes())}:${double(d.getSeconds())}`;
}

function pick (processes, idPosition, namePosition, valuePositions) {
  const re = {};
  processes.forEach((process) => {
    valuePositions.forEach((valuePosition) => {
      if (!re[valuePosition]) {
        re[valuePosition] = {};
      }
      const id = process[idPosition];
      if (process[namePosition].indexOf('top') !== -1) {
        return;
      }
      re[valuePosition][id] = {
        id: +process[idPosition],
        name: process[namePosition],
        value: +process[valuePosition],
      };
    });
  });
  return re;
}


export class DataStore {
  constructor () {
    this.store = {};
  }

  column (name) {
    const re = {};
    Object.keys(this.store).forEach((i) => {
      re.push({
        id: +this.store[i].pid,
        name: this.store[i].cmd,
        data: this.store[i].getByName(name),
      });
    });
    return re;
  }
}

class Watcher {
  constructor ({
    size, wait, tasks, totalCPU, totalMemory,
    CPUGraph, memoryGraph, initialData, names, realNames, min,
  }) {
    this.conf = {
      tasks,
      totalCPU,
      totalMemory,
      CPUGraph,
      memoryGraph,
      initialData,
      names,
      realNames,
      min,
    };

    Configure.wait = wait;
    Configure.size = size;
    Configure.min = min;
    Configure.keyMap = {};
    realNames.forEach((n, i) => {
      Configure.keyMap[n] = i;
    });

    this.store = new DataStore();
  }

  start () {
    this.initialize();
  }

  initialize () {
    this.timeList = [];
    const processList = {};
    const memoryList = {
      // 1: { id: 1, color: '#bdc3c7', name: 'free', data: [] },
      2: { id: 2, name: 'used', data: [] },
      3: { id: 3, name: 'buffers', data: [] },
    };

    const CPUList = {
      1: { id: 1, name: 'User', data: [] },
      2: { id: 2, name: 'System', data: [] },
      3: { id: 3, name: 'Nice', data: [] },
      // 4: { id: 4, color: '#bdc3c7', name: 'Idle', data: [] },
      5: { id: 5, name: 'IOWait', data: [] },
      6: { id: 6, name: 'HardwareInterrupt', data: [] },
      7: { id: 7, name: 'SoftwareInterrupt', data: [] },
      8: { id: 8, name: 'StolenTime', data: [] },
    };

    this.conf.initialData.forEach(({ memory, cpu, time, processes, rowPositions }, i) => {
      // manage time
      this.timeList.push(`${time * 1000}`);

      const {
        Total,
        Used,
        // Free,
        Buffers,
      } = memory;

      this.totalMemory = +Total;
      // memoryList[1].data.push(Math.round(+Free / this.totalMemory * 1000) / 10);
      memoryList[2].data.push(Math.round((+Used / this.totalMemory) * 1000) / 10);
      memoryList[3].data.push(Math.round((+Buffers / this.totalMemory) * 1000) / 10);

      const {
        User,
        System,
        Nice,
        // Idle,
        IOWait,
        HardwareInterrupt,
        SoftwareInterrupt,
        StolenTime,
      } = cpu;

      CPUList[1].data.push(User);
      CPUList[2].data.push(System);
      CPUList[3].data.push(Nice);
      // CPUList[4].data.push(Idle);
      CPUList[5].data.push(IOWait);
      CPUList[6].data.push(HardwareInterrupt);
      CPUList[7].data.push(SoftwareInterrupt);
      CPUList[8].data.push(StolenTime);

      if (!processes) {
        return;
      }

      // manage processes
      processes.forEach((process) => {
        const pid = process[rowPositions.PID];
        const cmd = process[rowPositions.COMMAND];
        if (cmd.indexOf('/top') !== -1 || cmd === 'top') {
          return;
        }

        const pidQueue = processList[pid]
          ? processList[pid]
          : processList[pid] = {
            pid,
            cmd,
            rowPositions,
            data: Configure.dataArray,
          };

        pidQueue.data[i] = { process };
      });
    });

    const gen = o => Object.assign({}, {
      size: Configure.size,
      xLabels: this.timeList,
      stack: true,
      w: 600,
      h: 300,
      xLabelHeight: 70,
      xSize: Configure.size,
      xLabelRotate: 90,
      yLabelWidth: 50,
      yMax: 100,
      yLabelStep: 20,
      rowItemWidth: 200,
      yLabelFormat: v => `${v} %`,
      xLabelFormat: v => dateString(v),
    }, o);

    const totalCPU = new PrettySimpleChart('totalCPU', gen({
      name: 'totalCPU',
      data: CPUList,
    })).render();

    const totalMemory = new PrettySimpleChart('totalMemory', gen({
      name: 'totalMemory',
      data: memoryList,
    })).render();

    const CPUGraph = new PrettySimpleChart('CPUGraph', gen({
      name: 'PerCPU',
      data: pickRow('%CPU', processList),
      stack: false,
    })).render();

    const memoryGraph = new PrettySimpleChart('memoryGraph', gen({
      name: 'PerMemory',
      data: pickRow('%MEM', processList),
    })).render();

    setInterval(() => {
      req
        .get('/r')
        .set('Accept', 'application/json')
        .end((err, res) => {
          const { processes, rowPositions, time: timeRaw, cpu, memory } = res.body;
          const time = timeRaw * 1000;
          const picked = pick(processes, rowPositions.PID, rowPositions.COMMAND, [rowPositions['%CPU'], rowPositions['%MEM']]);

          CPUGraph.add({
            data: picked[rowPositions['%CPU']],
            xLabel: time,
          });

          memoryGraph.add({
            type: 'add',
            data: picked[rowPositions['%MEM']],
            xLabel: time,
          });

          const memoryListData = {
            // 1: {
            // id: 1,
            // color: '#bdc3c7',
            // name: 'free',
            // value: Math.round(memory.Free / this.totalMemory * 1000) / 10 },
            2: {
              id: 2,
              color: '#e74c3c',
              name: 'used',
              value: Math.round((memory.Used / this.totalMemory) * 1000) / 10,
            },
            3: {
              id: 3,
              color: '#9b59b6',
              name: 'buffers',
              value: Math.round((memory.Buffers / this.totalMemory) * 1000) / 10,
            },
          };

          totalMemory.add({
            data: memoryListData,
            xLabel: time,
          });

          const CPUListData = {
            1: { id: 1, name: 'User', value: cpu.User },
            2: { id: 2, name: 'System', value: cpu.System },
            3: { id: 3, name: 'Nice', value: cpu.Nice },
            // 4: { id: 4, name: 'Idle', value: cpu.Idle },
            5: { id: 5, name: 'IOWait', value: cpu.IOWait },
            6: {
              id: 6,
              name: 'HardwareInterrupt',
              value: cpu.HardwareInterrupt,
            },
            7: {
              id: 7,
              name: 'SoftwareInterrupt',
              value: cpu.SoftwareInterrupt,
            },
            8: { id: 8, name: 'StolenTime', value: cpu.StolenTime },
          };

          totalCPU.add({
            data: CPUListData,
            xLabel: time,
          });
        });
    }, Configure.wait * 1000);
  }
}

window.Watcher = Watcher;
