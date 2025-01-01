<script setup lang="ts">

const { isSerialSupported, getBrowserInstructions } = useBrowserCompat();
const browserAlert = getBrowserInstructions();

</script>

<template>
  <v-dialog :model-value="!isSerialSupported" max-width="600" persistent>
    <v-card>
      <v-card-title>
        Browser Compatibility Warning
      </v-card-title>
      <v-card-text>
        {{ browserAlert?.message }}
        <br>
        {{ browserAlert?.recommendation }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn href="https://www.google.com/chrome/" target="_blank">
          Get Chrome
        </v-btn>
        <btn-primary to="/">
          Homepage
        </btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
