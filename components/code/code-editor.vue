<script lang="ts" setup>
import { useMonaco } from '@guolao/vue-monaco-editor';
import type { EditorOptions } from './code';

withDefaults(defineProps<{
  modelValue: string,
  theme?: string,
  language: string,
  path?: string,
  options?: EditorOptions,
}>(), {
  modelValue: '',
  language: 'cpp',
  path: '',
  theme: 'vs-dark',
  options: () => ({
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
  }),
});

defineEmits(['update:modelValue']);

const editorRef = shallowRef();
const { monacoRef, unload } = useMonaco();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleMount = (editor: any) => {
  editorRef.value = editor;
};

const ready = computed(() => !!monacoRef.value);

onUnmounted(() => !monacoRef.value && unload());

// your action
// function formatCode() {
//   editorRef.value?.getAction('editor.action.formatDocument').run();
// }
</script>

<template>
  <vue-monaco-editor
    v-if="ready"
    :value="modelValue"
    :theme="theme"
    :options="options"
    :language="language"
    :path="path"
    @mount="handleMount"
    @update:value="$emit('update:modelValue', $event)"
  />
</template>
