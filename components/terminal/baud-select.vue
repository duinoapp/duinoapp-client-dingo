<script setup lang="ts">

const serial = useSerial();

const baudRates = [
  300,
  1200,
  2400,
  4800,
  9600,
  14400,
  19200,
  38400,
  57600,
  115200,
  128000,
  256000,
];

</script>

<template>
  <v-select
    v-model="serial.baudRate"
    :items="baudRates"
    label="Baud Rate"
    variant="solo"
  />
</template>