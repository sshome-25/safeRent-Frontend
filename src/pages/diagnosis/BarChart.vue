<template>
  <div class="bar-chart-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ChartDataLabels)

function formatKoreanCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  // 억 단위 (만원 기준, 1억=10000만)
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const man = value % 10000;
    if (man === 0) {
      return `${eok}억`;
    } else {
      return `${eok}억 ${man.toLocaleString('ko-KR')}만`;
    }
  }
  if (value >= 1) {
    return `${value.toLocaleString('ko-KR')}만`;
  }
  return '-';
}

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    averageDeposit: {
      type: Number,
      required: true
    },
    propertyDeposit: {
      type: Number,
      required: true
    }
  },
  computed: {
    chartData() {
      const isHigher = this.propertyDeposit > this.averageDeposit;
      return {
        labels: [ '주변 평균 전세가', '본 매물 전세가' ],
        datasets: [
          {
            label: '전세가(만원)',
            data: [ this.averageDeposit, this.propertyDeposit ],
            backgroundColor: [ '#8ecae6', '#ffb703' ]
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: formatKoreanCurrency,
            font: {
              weight: 'bold',
              size: 14
            },
            color: '#000'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: formatKoreanCurrency
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.bar-chart-full {
  width: 100%;
  height: 100%;
}

.bar-chart-full canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  display: block;
}
</style>
