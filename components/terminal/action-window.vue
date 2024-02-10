<script lang="ts" setup>
import TerminalArea from './terminal-area.vue';

const tab = ref('program');
const programTerm = ref(null as typeof TerminalArea | null);
const monitorTerm = ref(null as typeof TerminalArea | null);

onMounted(() => {
  setTimeout(() => {
    if (!programTerm.value || !monitorTerm.value) return;
    programTerm.value.write('Hello Programmer');
    monitorTerm.value.write('Hello Monitor');
  }, 100);
});

</script>

<template>
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
        <v-icon start>
          mdi-console
        </v-icon>
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
  <v-window v-model="tab">
    <v-window-item value="program" eager>
      <terminal-area ref="programTerm" />
    </v-window-item>
    <v-window-item value="monitor" eager>
      <terminal-area ref="monitorTerm" />
    </v-window-item>
    <v-window-item value="plot" eager>
      <div style="height: -webkit-fill-available">
        put graph here
      </div>
    </v-window-item>
  </v-window>
</template>
