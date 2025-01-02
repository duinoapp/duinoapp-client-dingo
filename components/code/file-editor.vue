<script setup lang="ts">
import { useTheme } from 'vuetify';
import { useEditorModels, getUriString } from '@/composables/useEditorModels';
import CodeEditor from '@/components/code/code-editor.vue';

const tabs = useTabs();
const editorModels = useEditorModels();
const theme = useTheme();

const currentUri = ref<string | null>(null);

type CodeEditorType = InstanceType<typeof CodeEditor>;
const codeEditor = useTemplateRef<CodeEditorType>('editor');

const highlightColor = computed(() => theme.global.current.value.colors.primary);

// Load model when tab changes
watch([
  () => tabs.currentTab?.projectId,
  () => tabs.currentTab?.path,
  () => tabs.currentTab?.range,
], async ([projectId, path, range]) => {
  currentUri.value = null; // Clear URI while loading
  
  if (!projectId || !path || tabs.currentTab?.type !== 'file') return;
  
  // make sure we aren't racing with file system events
  await editorModels.waitUntilReady(true);

  const model = await editorModels.getModel(projectId, path, true);
  if (model) {
    // Only set URI after model is loaded
    currentUri.value = getUriString(projectId, path);

    setTimeout(() => {
      if (range) {
        codeEditor.value?.editorRef?.revealRangeInCenter(range);
        codeEditor.value?.editorRef?.setSelection(range);
        tabs.clearRange(tabs.currentTab!);
      }
    }, 100);
  }
}, { immediate: true });

</script>

<template>
  <v-progress-linear
    :style="{ opacity: editorModels.loading ? 1 : 0 }"
    indeterminate
    color="primary"
    height="1"
  />
  <code-editor
    :uri="currentUri"
    :highlight-color="highlightColor"
    style="height: calc(100% - 1px);"
    ref="editor"
  />
</template>
