<script lang="ts" setup>
import type { IDisposable } from 'monaco-editor/esm/vs/editor/editor.api';

const props = withDefaults(defineProps<{
  uri?: string | null,
}>(), {
  uri: null,
});

const editorModels = useEditorModels();

const content = ref('');
const ready = ref(false);
const disposable = ref<IDisposable | null>(null);

const setEditorModel = (uri: string) => {
  const model = editorModels.getModelByUri(uri);
  if (!model) return;

  content.value = model.getValue();
  ready.value = true;

  if (disposable.value) {
    disposable.value.dispose();
  }

  disposable.value = model.onDidChangeContent(() => {
    const newContent = model.getValue();
    console.log('newContent', newContent);
    console.log('content', content.value);
    if (newContent !== content.value) {
      content.value = newContent;
    }
  });
};

// Watchers
watch(() => props.uri, (newUri) => {
  ready.value = false;
  if (newUri) {
    setEditorModel(newUri);
  }
});

watch(() => content.value, (newContent) => {
  if (!props.uri) return;
  const model = editorModels.getModelByUri(props.uri);
  if (!model) return;
  if (newContent !== model.getValue()) {
    model.setValue(newContent);
  }
});

onUnmounted(() => {
  if (disposable.value) {
    disposable.value.dispose();
  }
});

</script>

<template>
  <tiptap-editor
    v-if="ready"
    :key="props.uri || ''"
    v-model="content"
    style="height: calc(100% - 1px);"
    class="pa-6"
  />
</template>
