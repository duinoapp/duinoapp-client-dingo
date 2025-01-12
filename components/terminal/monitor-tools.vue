<script setup lang="ts">

const props = defineProps<{
  isPlotter: boolean
}>();

const serialTerm = useSerialTerminal();
const serial = useSerial();

const message = ref('');
const appendNewLine = ref(false);

const send = async () => {
  if (appendNewLine.value) {
    message.value += '\n';
  }
  console.log('Send', message.value);
  message.value = '';
};

const disconnect = async () => {
  serialTerm.clear();
  serial.close();
};

const clear = () => {
  serialTerm.clear();
};

const windowItems = computed(() => [
  { title: '10 seconds', value: 10 },
  { title: '30 seconds', value: 30 },
  { title: '1 minute', value: 60 },
  { title: '5 minutes', value: 300 },
  { title: '10 minutes', value: 600 },
  { title: '30 minutes', value: 1800 },
  { title: '1 hour', value: 3600 },
  { title: '5 hours', value: 18000 },
  { title: '10 hours', value: 36000 },
  { title: '1 day', value: 86400 },
]);

</script>

<template>
  <div class="d-flex align-center px-3" style="height: 100%">
    <v-text-field
      v-model="message"
      density="compact"
      variant="solo"
      hide-details
    />
    <v-btn
      :disabled="!message"
      class="ml-2"
      density="compact"
      variant="text"
      icon
      @click="send"
    >
      <v-icon size="small">
        mdi-send-variant-outline
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Send Message
      </v-tooltip>
    </v-btn>
    <v-btn
      :color="serial.appendNewLine ? 'primary' : undefined"
      class="ml-2"
      density="compact"
      variant="text"
      icon
      @click="serial.appendNewLine = !serial.appendNewLine"
    >
      <v-icon size="small">
        mdi-keyboard-return
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Append New Line (\n) to Message ({{ serial.appendNewLine ? 'on' : 'off' }})
      </v-tooltip>
    </v-btn>
    <v-btn
      v-if="isPlotter"
      class="ml-2"
      density="compact"
      variant="text"
      icon
      :color="serial.plotLockY ? 'primary' : undefined"
      @click="serial.plotLockY = !serial.plotLockY"
    >
      <v-icon size="small">
        mdi-arrow-vertical-lock
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Lock Y Axis to Zero ({{ serial.plotLockY ? 'on' : 'off' }})
      </v-tooltip>
    </v-btn>
    <v-btn
      class="ml-2"
      density="compact"
      variant="text"
      icon
      @click="disconnect"
    >
      <v-icon size="small">
        mdi-close-network-outline
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Disconnect Device
      </v-tooltip>
    </v-btn>
    <v-btn
      class="ml-2"
      density="compact"
      variant="text"
      icon
      @click="clear"
    >
      <v-icon size="small">
        mdi-eraser-variant
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Clear Monitor
      </v-tooltip>
    </v-btn>
    <v-btn
      v-if="isPlotter"
      :color="serial.plotPaused ? 'primary' : undefined"
      class="ml-2"
      density="compact"
      variant="text"
      icon
      @click="serial.plotPaused = !serial.plotPaused"
    >
      <v-icon size="small">
        {{ serial.plotPaused ? 'mdi-play' : 'mdi-pause' }}
      </v-icon>
      <v-tooltip
        activator="parent"
        location="top"
      >
        Pause Plotter ({{ serial.plotPaused ? 'on' : 'off' }})
      </v-tooltip>
    </v-btn>
    <v-select
      v-model="serial.plotTimeWindow"
      :items="windowItems"
      density="compact"
      variant="outlined"
      label="Time Window"
      hide-details
      style="max-width: 130px;"
      class="ml-2"
    />
    <baud-select
      density="compact"
      hide-details
      style="max-width: 130px;"
      class="ml-2"
    />
  </div>
</template>