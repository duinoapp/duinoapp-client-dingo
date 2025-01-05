<script setup lang="ts">

import { useTheme } from 'vuetify'

const theme = useTheme();

const variant = computed(() => {
  return theme.global.current.value.dark ? 'tonal' : 'flat';
});

</script>

<template>
  <v-btn
    color="primary"
    :variant="variant"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>
