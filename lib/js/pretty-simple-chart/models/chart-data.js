import ChartRow from './chat-row';

export default class ChartData {
  constructor (raw, size, isStack = false) {
    this.data = {};
    this.size = size;
    this.total = 0;
    this.stack = [];
    this.isStack = isStack;

    Object.keys(raw).forEach((k) => {
      const row = new ChartRow(raw[k]);
      if (row.total !== 0) {
        this.data[k] = row;
      }
    });

    if (!this.isStack) {
      return;
    }

    Object.keys(this.data).forEach((k) => {
      this.data[k].prepareStack();
    });

    for (let i = size; i--;) {
      let pre = 0;
      Object.keys(this.data).forEach((k) => {
        const now = this.data[k];
        now.setInStack(i, pre + now.data[i]);
        pre = now.stack[i];
      });
    }
  }

  removeRow (row) {
    delete this.data[row.id];
  }

  add (newData) {
    let pre = 0;

    // 既存の row に反映
    Object.keys(this.data).forEach((k) => {
      const row = this.data[k];

      let next;
      if (newData[row.id]) {
        next = newData[row.id].value;
        delete newData[row.id]; // eslint-disable-line no-param-reassign
      } else {
        next = 0;
      }
      pre += next;
      row.shiftAndPush(next, pre);

      row.removable && this.removeRow(row);
    });

    // 新しい row を追加
    Object.keys(newData).forEach((k) => {
      const {
        id,
        name,
        value,
      } = newData[k];

      const data = [];

      for (let ii = this.size - 1; ii--;) {
        data[ii] = 0;
      }

      data.push(value);

      const row = new ChartRow({ id, name, data });

      if (row.total === 0) {
        return;
      }

      if (this.isStack) {
        let previousLine;
        for (let ii = id; ii--;) {
          if (this.data[ii]) {
            previousLine = this.data[ii];
            break;
          }
        }

        row.copyStackFrom(previousLine);
        row.stack[data.length - 1] += value;
      }

      this.data[id] = row;
    });
  }
}
