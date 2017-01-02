/* global describe, it, expect, beforeEach, assert */

import assert from 'power-assert';
import ChartRow from '../../js/pretty-simple-chart/models/chart-row'

const normal = {
  id: 1,
  name: 'test row',
  data: [1, 2, 3],
  color: '#000',
};

const removable = {
  id: 1,
  name: 'removable row',
  data: [0, 0, 0],
  color: '#000'
};

const previousChart = new ChartRow({
  id: 1,
  name: 'test row',
  data: [10, 20, 30],
  color: '#000',
});

describe('ChartRow', () => {
  it('initialize', () => {
    const c = new ChartRow(normal);

    assert(c.total === 60);
    assert.deepEqual(c.data, [1, 2, 3]);
    assert.deepEqual(c.stack, [1, 2, 3]);
  });

  it('copyStackFrom', () => {
    const c = new ChartRow(normal);

    c.copyStackFrom(previousChart);

    assert.deepEqual(c.data, [1, 2, 3]);
    assert.deepEqual(c.stack, [10, 20, 30]);
  });

  it('shiftAndPush', () => {
    const c = new ChartRow(normal);

    c.shiftAndPush(4, 8);

    assert(c.total === 90);
    assert.deepEqual(c.data, [2, 3, 4]);
    assert.deepEqual(c.stack, [2, 3, 8]);
  });

  describe('removable', () => {
    it('removable', () => {
      const c = new ChartRow(removable);
      assert(c.removable);
    });

    it('not', () => {
      const c = new ChartRow(normal);
      assert(!c.removable);
    });

    it('to be removable', () => {
      const c = new ChartRow(normal);

      c.shiftAndPush(0, 8);
      c.shiftAndPush(0, 8);
      c.shiftAndPush(0, 8);

      assert(c.removable);
    });
  });
});