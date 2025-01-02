<script lang="ts" setup>
import { useMonaco } from '@guolao/vue-monaco-editor';
import type { editor } from 'monaco-editor';
import type { EditorOptions } from './code';
import { useEditorModels } from '@/composables/useEditorModels';

const props = withDefaults(defineProps<{
  uri?: string | null,
  theme?: string,
  options?: EditorOptions,
}>(), {
  uri: null,
  theme: 'vs-dark',
  options: () => ({
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
  }),
});

const editorRef = shallowRef<editor.IStandaloneCodeEditor>();
const { monacoRef, unload } = useMonaco();
const editorModels = useEditorModels();

// Helper functions to manage editor state
const saveEditorState = (uri: string) => {
  if (!editorRef.value) return;
  const state = editorRef.value.saveViewState();
  editorModels.saveViewState(uri, state);
};

const setEditorModel = (uri: string) => {
  if (!editorRef.value) return;
  const model = editorModels.getModelByUri(uri);
  if (!model) return;

  editorRef.value.setModel(model);
  const state = editorModels.getViewState(uri);
  if (state) {
    editorRef.value.restoreViewState(state);
  }
};

// Event handlers
const handleMount = (editor: editor.IStandaloneCodeEditor) => {
  if (editorRef.value) return;
  editorRef.value = editor;
  if (props.uri) {
    setEditorModel(props.uri);
  }
};

// Computed
const ready = computed(() => !!monacoRef.value);

// Watchers
watch(() => props.uri, (newUri, oldUri) => {
  if (!editorRef.value) return;

  if (oldUri) {
    saveEditorState(oldUri);
  }
  if (newUri) {
    setEditorModel(newUri);
  }
});

// Lifecycle
onBeforeUnmount(() => {
  if (props.uri) {
    saveEditorState(props.uri);
  }
  if (!monacoRef.value) unload();
});
</script>

<template>
  <vue-monaco-editor
    v-if="ready"
    :theme="theme"
    :options="options"
    @mount="handleMount"
  />
</template>
