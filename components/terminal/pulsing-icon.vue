<script setup lang="ts">

const serialTerm = useSerialTerminal();

const unsubscribe = ref<(() => void) | null>(null);
const timeout = ref<any>(null);
const pulsing = ref(false);

const pulse = () => {
  if (timeout.value) clearTimeout(timeout.value);
  pulsing.value = true;
  timeout.value = setTimeout(() => {
    pulsing.value = false;
  }, 150);
};

onMounted(() => {
  unsubscribe.value = serialTerm.$onAction(({name}) => {
    if (name === 'write') pulse();
  });
});

onBeforeUnmount(() => {
  unsubscribe.value?.();
  if (timeout.value) clearTimeout(timeout.value);
});

</script>

<template>
  <v-icon
    :class="{ 'pulse-icon': true, 'pulsing': pulsing }"
  >
    <slot />
  </v-icon>
</template>

<style lang="scss" scoped>
.pulse-icon {
  transition: color 0.25s;

  &.pulsing {
    color: rgb(var(--v-theme-primary));
    transition: none;
  }
}
</style>
