<script lang="ts" setup>
import TerminalArea from './terminal-area.vue';

const panels = usePanels();
const compiler = useCompiler();

const tab = ref('program');
const heightType = ref('height');
const programTerm = ref(null as typeof TerminalArea | null);
const monitorTerm = ref(null as typeof TerminalArea | null);

const reFit = () => {
  heightType.value = 'height';
  setTimeout(() => {
    if (tab.value === 'program') {
      programTerm.value?.fit();
      programTerm.value?.focus();
      heightType.value = 'max-height';
    } else if (tab.value === 'monitor') {
      monitorTerm.value?.fit();
      monitorTerm.value?.focus();
      heightType.value = 'max-height';
    } else if (tab.value === 'plot') {
      // The plotter will auto-fit due to Chart.js responsive mode
    }
  }, 50);
};

watch(tab, () => reFit(), { immediate: true });
watch(panels.layoutState, () => reFit(), { immediate: true });
watch(computed(() => compiler.compiling), (value) => {
  if (value) {
    tab.value = 'program';
  }
});

</script>

<template>
  <div style="height: 100%; position: relative;" class="d-flex flex-column">
    <div class="d-flex align-center">
      <v-tabs
        v-model="tab"
        density="compact"
      >
        <v-tab value="program">
          <v-icon start>
            mdi-upload-network-outline
          </v-icon>
          Program
        </v-tab>
        <v-tab value="monitor">
          <pulsing-icon start>
            mdi-console
          </pulsing-icon>
          Monitor
        </v-tab>
        <v-tab value="plot">
          <v-icon start>
            mdi-chart-bell-curve
          </v-icon>
          Plot
        </v-tab>
      </v-tabs>
      <v-spacer />
      <div class="flex-grow-0 px-3">
        <program-actions />
      </div>
    </div>
    <connect-overlay v-show="tab !== 'program'" />
    <div :style="`${heightType}: calc(100% - ${tab === 'program' ? 36 : 76}px);`">
      <terminal-area v-show="tab === 'program'" ref="programTerm" type="program" />
      <terminal-area v-show="tab === 'monitor'" ref="monitorTerm" type="serial" />
      <plotter v-show="tab === 'plot'" :active="tab === 'plot'" ref="plotter" height="100%" />
    </div>
    <div v-show="tab !== 'program'" class="flex-grow-1">
      <monitor-tools :is-plotter="tab === 'plot'" />
    </div>
  </div>
</template>
