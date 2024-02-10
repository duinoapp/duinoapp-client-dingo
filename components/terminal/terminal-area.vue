<script setup lang="ts">
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

withDefaults(defineProps<{
  height?: string,
}>(), {
  height: '-webkit-fill-available',
});

const id = ref(`xterm-${Math.random().toString(36).slice(2)}`);
const terminal = shallowRef<Terminal | null>(null);

onMounted(() => {
  const term = new Terminal({
    disableStdin: true,
    // ...($attrs || {}),
  });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(document.getElementById(id.value)!);
  fitAddon.fit();
  terminal.value = term;
});

onBeforeUnmount(() => {
  terminal.value?.dispose();
});

const write = (val = '') => {
  if (typeof val !== 'string') return;
  terminal.value?.write(val.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
};

const clear = () => {
  terminal.value?.write('\r\n');
  terminal.value?.clear();
};

const focus = () => {
  terminal.value?.focus();
};

const blur = () => {
  terminal.value?.blur();
};

// const fit = () => {
//   terminal.value?.fit();
// };

const cols = () => terminal.value?.cols;

defineExpose({
  write,
  clear,
  focus,
  blur,
  // fit,
  cols,
  terminal,
});

</script>

<template>
  <div :id="id" :style="{ height, width: '100%' }" />
</template>
