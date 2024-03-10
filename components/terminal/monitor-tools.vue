<script setup lang="ts">

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
      class="ml-2"
      density="compact"
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
    <baud-select
      density="compact"
      hide-details
      style="max-width: 130px;"
      class="ml-2"
    />
  </div>
</template>