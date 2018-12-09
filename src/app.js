const Highcharts = require('highcharts');
const os = require('os');

let categories = [];
let previousData = [];

os.cpus().forEach((core, index) => {
  previousData.push({
    irq: core.times.irq,
    nice: core.times.nice,
    sys: core.times.sys,
    user: core.times.user,
    idle: core.times.idle,
  })
});


function generateData() {

  const cpuCores = os.cpus();

  let cpuSeries = [{
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

    const total = core.times.irq - previousData[index].irq +
      core.times.nice - previousData[index].nice +
      core.times.sys - previousData[index].sys +
      core.times.user - previousData[index].user +
      core.times.idle - previousData[index].idle;

    cpuSeries[0].data.push(Math.round((core.times.irq - previousData[index].irq) / total  * 100));
    cpuSeries[1].data.push(Math.round((core.times.nice - previousData[index].nice) / total * 100));
    cpuSeries[2].data.push(Math.round((core.times.sys - previousData[index].sys) / total * 100));
    cpuSeries[3].data.push(Math.round((core.times.user - previousData[index].user) / total * 100));
    cpuSeries[4].data.push(Math.round((core.times.idle - previousData[index].idle) / total * 100));

    previousData[index].irq = core.times.irq;
    previousData[index].nice = core.times.nice;
    previousData[index].sys = core.times.sys;
    previousData[index].user = core.times.user;
    previousData[index].idle = core.times.idle;
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
    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
      }
    },
  },
  credits: {
    enabled: false,
  },
  series: generateData(),
});