function double (n) {
  return (n < 10 ? '0' : '') + n;
}

function dateString (unixTime) {
  const d = new Date(+unixTime);
  return `${double(d.getHours())}:${double(d.getMinutes())}:${double(d.getSeconds())}`;
}

export default class ChartConfiguration {
  constructor ({
    data = [],
    dataLength = 0,
    refreshWaitTime = 1000,

    isStackChart = false,

    chartWidth = 800,
    chartHeight = 400,

    xLabels = [],
    xLabelHeight = 70,
    xLabelRotate = 90,

    yValueMax = 100,
    yLabelStepRangeRange = 10,
    yLabelWidth = 50,

    dataItemListWidth = 200,

    yLabelFormat = v => `${v} %`,
    xLabelFormat = v => dateString(v),
  } = {}) {
    const props = {
      data,
      dataLength,
      refreshWaitTime,

      isStackChart,

      chartWidth,
      chartHeight,

      xLabels,
      xLabelHeight,
      xLabelRotate,

      yValueMax,
      yLabelStepRangeRange,
      yLabelWidth,

      dataItemListWidth,

      xLabelFormat,
      yLabelFormat,
    };

    Object.keys(props).forEach((k) => {
      this[k] = props[k];
    });
  }

  cloneWith (assignee = {}) {
    return Object.assign({}, this, assignee);
  }
}
