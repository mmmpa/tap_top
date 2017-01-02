import { numToColor } from '../utils/color-wheel';

export default class ChartRow {
  constructor ({ id, name = '', data = [], dataLength = 0, color }) {
    this.id = id;
    this.name = name;
    this.data = data.concat();
    this.dataLength = dataLength;
    this.stack = this.data.concat();
    this.total = this.data.reduce((a, n) => a + Math.floor(n * 10), 0);

    this.color = color || numToColor(this.id);

    while (this.data.length < this.dataLength) {
      this.data.push(0);
    }
  }

  copyStackFrom (previousLine = null) {
    this.stack = (
      previousLine
        ? previousLine.stack
        : this.data
    ).map(d => d);
  }

  shiftAndPush (value, stackValue) {
    const remove = this.data.shift();
    this.total += (Math.floor(value * 10) - Math.floor(remove * 10));
    this.data.push(value);

    this.stack.shift();
    this.stack.push(stackValue);
  }

  get removable () {
    return this.total <= 0;
  }

  setInStack (i, v) {
    this.stack[i] = v;
  }
}
