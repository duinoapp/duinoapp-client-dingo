<script setup lang="ts">
// @ts-ignore
import * as CanvasJS from '@canvasjs/charts';

const props = withDefaults(defineProps<{
  height?: string
  active?: boolean
}>(), {
  height: '100%',
  active: true,
});

const serialStore = useSerial();
const serialTerm = useSerialTerminal();
const settings = useSettings();

type DataSet = {
  type: 'line',
  dataPoints: { x: number, y: number }[],
  pausedPoints: { x: number, y: number }[],
  xValueType: string,
  xValueFormatString: string,
};

const chartId = ref(`chart-${Math.random().toString(36).slice(2)}`);
const chart = shallowRef<any>(null);
const datasets = shallowRef<DataSet[]>([]);
const lastRendered = ref(0);
const buffer = ref('');

const initChart = () => {
  chart.value = new CanvasJS.Chart(chartId.value, {
    zoomEnabled: true,
    theme: settings.isDarkTheme ? "dark2" : "light2",
    backgroundColor: 'transparent',
    axisY: {
      includeZero: serialStore.plotLockY,
    },
    axisX: {
      intervalType: 'millisecond',
      valueFormatString: ' ',
    },
    data: datasets.value,
  });

  chart.value.render();
};

const cullData = (array: DataSet['dataPoints'], now: number) => {
  const cutoff = now - (serialStore.plotTimeWindow * 1000);
  // return array.filter(point => point.x >= cutoff);
  const indexes = [];
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i].x < cutoff) {
      indexes.push(i);
    }
  }
  indexes.forEach(i => array.splice(i, 1));
};

const processData = (data: string) => {
  if (!props.active) return;
  const now = Date.now();
  const values = data.trim()
    .replace(/(^\[)|(\]$)/g, '')
    .split(/[\s,]+/)
    .map(v => v === '' ? NaN : Number(v));
  if (values.every(isNaN)) return;

  // Create or update datasets
  while (datasets.value.length < values.length) {
    datasets.value.push({
      type: "line",
      // showInLegend: true,
      // name: `Series ${datasets.value.length + 1}`,
      // markerSize: 0,
      xValueType: 'dateTime',
      xValueFormatString: 'HH:mm:ss.fff',
      dataPoints: [],
      pausedPoints: [],
    });
  }

  // Update chart datasets
  values.forEach((value, index) => {
    const dataset = datasets.value[index];
    cullData(dataset.pausedPoints, now);
    if (!serialStore.plotPaused) cullData(dataset.dataPoints, now);
    if (isNaN(value)) return;
    
    if (serialStore.plotPaused) {
      dataset.pausedPoints.push({ x: now, y: value });
    } else {
      if (dataset.pausedPoints.length > 0) {
        dataset.pausedPoints.forEach(point => dataset.dataPoints.push(point));
        dataset.pausedPoints = [];
      }
      dataset.dataPoints.push({ x: now, y: value });
    }
  });
  
  // Update chart
  if (chart.value && now - lastRendered.value > 50) {
    lastRendered.value = now;
    chart.value.render();
  }
};

const clearData = () => {
  datasets.value = [];
  if (chart.value) {
    chart.value.options.data = datasets.value;
    chart.value.render();
  }
};

const unsubscribe = ref<(() => void) | null>(null);

onMounted(() => {
  initChart();
  
  // Subscribe to serial terminal data
  if (unsubscribe.value) {
    unsubscribe.value();
  }
  unsubscribe.value = serialTerm.$onAction(({name, args}) => {
    if (name === 'write') {
      buffer.value += args[0];
      const lines = buffer.value.split(/\r?\n/g);
      const end = lines.pop();
      lines.forEach(line => line && processData(line));
      buffer.value = end || '';
    }
    if (name === 'clear') {
      clearData();
    }
  });
});

onBeforeUnmount(() => {
  chart.value?.destroy();
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

watch(() => serialStore.port, (newPort) => {
  if (!newPort) {
    clearData();
  }
});

watch(() => serialStore.plotLockY, (newLock) => {
  if (chart.value) {
    chart.value.options.axisY.includeZero = newLock;
    chart.value.render();
  }
});

watch(() => settings.isDarkTheme, (newTheme) => {
  if (chart.value) {
    chart.value.options.theme = newTheme ? "dark2" : "light2";
    chart.value.render();
  }
});

</script>

<template>
  <div :style="{ height, width: '100%' }">
    <div :id="chartId" class="canvasjs-chart-container"></div>
  </div>
</template>

<style scoped lang="scss">
.canvasjs-chart-container {
  height: 100%;
  width: 100%;

  &:deep(.canvasjs-chart-credit) {
    display: none;
  }
}
</style>