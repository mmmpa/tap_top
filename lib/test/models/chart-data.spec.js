/* global describe, it, expect, beforeEach, assert */

import assert from 'power-assert';
import ChartData from '../../js/pretty-simple-chart/models/chart-data'
import ChartRow from '../../js/pretty-simple-chart/models/chart-row'

const normal = {
  data: {
    1: { id: 1, data: [1, 2, 3, 4] },
    3: { id: 3, data: [10, 20, 30, 40] },
    4: { id: 4, data: [0, 0, 0, 0] },
    100: { id: 100, data: [100, 200, 300, 400] },
    101: { id: 101, data: [1000] },
  },
  dataLength: 4,
  isStack: false,
};

const stack = Object.assign({}, normal, { isStack: true });

describe('ChartDate', () => {
  it('initialize', () => {
    const c = new ChartData(normal);

    Object.keys(c.data).forEach((k) => {
      assert(c.data[k] instanceof ChartRow)
    });

    assert(!c.data[4]);

    assert.deepEqual(c.data[1].data, [1, 2, 3, 4]);
    assert.deepEqual(c.data[3].data, [10, 20, 30, 40]);
    assert.deepEqual(c.data[100].data, [100, 200, 300, 400]);
    assert.deepEqual(c.data[101].data, [1000, 0, 0, 0]);
  });

  it('initialize stack', () => {
    const c = new ChartData(stack);

    assert.deepEqual(c.data[1].stack, [1, 2, 3, 4]);
    assert.deepEqual(c.data[3].stack, [11, 22, 33, 44]);
    assert.deepEqual(c.data[100].stack, [111, 222, 333, 444]);
    assert.deepEqual(c.data[101].stack, [1111, 222, 333, 444]);
  });

  it('removeRow', () => {
    const c = new ChartData(stack);

    assert(c.data[1]);
    c.removeRow({ id: 1 });
    assert(!c.data[1]);

    assert(c.data[3]);
    c.removeRow(3);
    assert(!c.data[3]);
  });

  describe('add', () => {
    it('add', () => {
      const c = new ChartData(normal);

      c.add({
        1: { id: 1, value: 5 },
        3: { id: 3, value: 50 },
        100: { id: 100, value: 500 },
        101: { id: 101, value: 5000 },
      });

      assert.deepEqual(c.data[1].data, [2, 3, 4, 5]);
      assert.deepEqual(c.data[3].data, [20, 30, 40, 50]);
      assert.deepEqual(c.data[100].data, [200, 300, 400, 500]);
      assert.deepEqual(c.data[101].data, [0, 0, 0, 5000]);
    });

    it('remove zero flat line', () => {
      const c = new ChartData(normal);

      assert(c.data[1]);
      c.add({ 1: { id: 1, value: 0 } });
      c.add({ 1: { id: 1, value: 0 } });
      c.add({ 1: { id: 1, value: 0 } });
      c.add({ 1: { id: 1, value: 0 } });
      assert(!c.data[1]);
    });

    it('fill lack of value with zero', () => {
      const c = new ChartData(normal);

      c.add({
        1: { id: 1, value: 5 },
      });

      assert.deepEqual(c.data[1].data, [2, 3, 4, 5]);
      assert.deepEqual(c.data[3].data, [20, 30, 40, 0]);
      assert.deepEqual(c.data[100].data, [200, 300, 400, 0]);
    });

    it('add new line', () => {
      const c = new ChartData(stack);

      c.add({
        1: { id: 1, value: 5 },
        3: { id: 3, value: 50 },
        50: { id: 50, value: 10000 },
        100: { id: 100, value: 500 },
        101: { id: 101, value: 5000 },
      });

      assert.deepEqual(c.data[1].data, [2, 3, 4, 5]);
      assert.deepEqual(c.data[3].data, [20, 30, 40, 50]);
      assert.deepEqual(c.data[50].data, [0, 0, 0, 10000]);
      assert.deepEqual(c.data[100].data, [200, 300, 400, 500]);
      assert.deepEqual(c.data[101].data, [0, 0, 0, 5000]);

      assert.deepEqual(c.data[1].stack, [2, 3, 4, 5]);
      assert.deepEqual(c.data[3].stack, [22, 33, 44, 55]);
      assert.deepEqual(c.data[50].stack, [22, 33, 44, 10055]);
      assert.deepEqual(c.data[100].stack, [222, 333, 444, 10555]);
      assert.deepEqual(c.data[101].stack, [222, 333, 444, 15555]);
    });
  });
});
