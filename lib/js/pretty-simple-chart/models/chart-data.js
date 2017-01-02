import ChartRow from './chart-row';

export default class ChartData {
  constructor ({ data: raw, dataLength, isStack = false }) {
    this.data = {};
    this.dataLength = dataLength;
    this.isStack = isStack;

    console.log(this)

    Object.keys(raw).forEach((k) => {
      const row = new ChartRow(Object.assign({ dataLength }, raw[k]));
      if (row.total !== 0) {
        this.data[k] = row;
      }
    });

    this.isStack && this.initializeStackOnRows();
  }

  initializeStackOnRows () {
    for (let i = this.dataLength; i--;) {
      let pre = 0;
      Object.keys(this.data).forEach((k) => {
        const now = this.data[k];
        now.setInStack(i, pre + (now.data[i] || 0));
        pre = now.stack[i];
      });
    }
  }

  removeRow (row) {
    const id = row.id || row;
    delete this.data[id];
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

      // for stack value
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

      for (let ii = this.dataLength - 1; ii--;) {
        data[ii] = 0;
      }

      data.push(value);

      const row = new ChartRow({ id, name, data });

      if (row.total === 0) {
        return;
      }

      if (this.isStack) {
        let previousLine;
        let inserted = false;
        Object.keys(this.data).forEach((kk) => {
          if (kk > id) {
            if (!inserted) {
              row.copyStackFrom(previousLine);
              row.stack[data.length - 1] += value;
              inserted = true;
            }

            this.data[kk].stack[data.length - 1] += value;
          }
          previousLine = this.data[kk];
        });
      }

      this.data[id] = row;
    });
  }
}
