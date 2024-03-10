<script setup lang="ts">
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const props = withDefaults(defineProps<{
  height?: string,
  type?: 'program' | 'serial',
}>(), {
  height: '100%',
  type: 'program',
});

const serialStore = useSerialTerminal();
const programStore = useProgramTerminal();

const id = ref(`xterm-${Math.random().toString(36).slice(2)}`);
const terminal = shallowRef<Terminal | null>(null);
const fitAddon = shallowRef<FitAddon | null>(null);
const unsubscribe = ref<(() => void) | null>(null);

const currentStore = computed(() => {
  return props.type === 'program' ? programStore : serialStore;
});

onMounted(() => {
  const term = new Terminal({
    disableStdin: true,
    theme: {
      background: 'rgb(var(--v-theme-background))',
      foreground: 'rgb(var(--v-theme-on-background))',
    },
    // ...($attrs || {}),
  });
  fitAddon.value = new FitAddon();
  term.loadAddon(fitAddon.value);
  term.open(document.getElementById(id.value)!);
  fitAddon.value.fit();
  terminal.value = term;
});

onBeforeUnmount(() => {
  terminal.value?.dispose();
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

const write = (val = '') => {
  if (typeof val !== 'string') return;
  terminal.value?.write(val.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
};

const clear = () => {
  // terminal.value?.write('\r\n');
  terminal.value?.clear();
};

const focus = () => {
  terminal.value?.focus();
};

const blur = () => {
  terminal.value?.blur();
};

const fit = () => {
  // terminal.value?.fit();
  fitAddon.value?.fit();
};

const cols = () => terminal.value?.cols;

watch(currentStore, () => {
  if (unsubscribe.value) {
    unsubscribe.value();
    unsubscribe.value = null;
  }
  if (currentStore.value) {
    unsubscribe.value = currentStore.value.$onAction(({name, args}) => {
      if (name === 'write') write(...args);
      if (name === 'clear') clear();
    });
  }
}, { immediate: true });

defineExpose({
  write,
  clear,
  focus,
  blur,
  fit,
  cols,
  terminal,
});

</script>

<template>
  <div :id="id" :style="{ height, width: '100%' }" />
</template>
