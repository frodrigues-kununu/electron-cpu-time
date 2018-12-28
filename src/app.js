const Highcharts = require('highcharts');
const os = require('os');

const categories = [];
const previousData = [];

os.cpus().forEach((core, index) => {
  Object.keys(core.times).forEach((val, cpuMode) => {
    previousData.push({[cpuMode]: val});
  });
});

function generateData() {

  const cpuCores = os.cpus();
  const cpuSeries = [{
    name: 'irq',
    data: []
  }, {
    name: 'nice',
    data: []
  }, {
    name: 'sys',
    data: []
  }, {
    name: 'user',
    data: []
  }, {
    name: 'idle',
    data: []
  }];

  cpuCores.forEach((core, index) => {
    categories.push(`core ${index}`);

      const total = Object.keys(core.times).reduce((acc, cpuMode) => {
       return acc += core.times[cpuMode] - previousData[index][cpuMode];
      }, 0);

    cpuSeries.forEach((val, idx) => {
      const currentCpuMode = cpuSeries[idx].name;
      const nextCpuModeValue = (core.times[currentCpuMode] - previousData[index][currentCpuMode]) / total * 100;

      val.data.push(Math.round(nextCpuModeValue));
      previousData[index][currentCpuMode] = core.times[currentCpuMode];
    });
  });

  return cpuSeries;
}

generateData();

Highcharts.chart('chartContainer', {
  chart: {
    type: 'column',
    backgroundColor: '#2b2e3a',
    events: {
      load: function () {
        let chartSeries = this.series;
        setInterval(() => {
          let cpuSeries = generateData();

          cpuSeries.forEach((series, index) => {
            chartSeries[index].update({
              data: series.data,
            })
          })

          var series = this.series[0];
        }, 1000)
      }
    },
  },
  title: {
    text: 'CPU USAGE',
    style: {
      color: 'white',
    }
  },
  xAxis: {
    categories: categories,
    labels: {
      style: {
        color: 'white',
      }
    },
  },
  yAxis: {
    min: 0,
    max: 100,
    title: {
      text: 'System usage in the last cycle (%)',
      style: {
        color: 'white',
      }
    },
    labels: {
      style: {
        color: 'white',
      }
    },
    stackLabels: {
      enabled: true,
      style: {
        fontWeight: 'bold',
        color: 'white',
      }
    }
  },
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    x: 0,
    y: 0,
    backgroundColor: 'white',
  },
  tooltip: {
    headerFormat: '<b>{point.x}</b><br/>',
    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
      }
    },
  },
  credits: {
    enabled: false,
  },
  series: generateData(),
});
