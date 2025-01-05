<script setup lang="ts">

const serial = useSerial();

</script>

<template>
  <v-select
    v-model="serial.baudRate"
    :items="serial.baudRateItems"
    label="Baud Rate"
    variant="outlined"
  />
</template>