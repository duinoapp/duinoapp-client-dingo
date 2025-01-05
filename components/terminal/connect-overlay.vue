<script setup lang="ts">

const serial = useSerial();

</script>

<template>
  <div v-if="!serial.port" class="connect-overlay">
    <v-card title="Connect Device" style="width: 250px;">
      <v-card-text>
        <baud-select
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
        />
        <btn-primary
          :loading="serial.connecting"
          :disabled="!serial.baudRate"
          block
          @click="serial.open"
        >
          Connect
        </btn-primary>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped lang="scss">

.connect-overlay {
  position: absolute;
  height: calc(100% - 36px);
  width: 100%;
  top: 36px;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(1px);
  z-index: 1;
}

</style>