<script setup lang="ts">
import { useTheme } from 'vuetify';
import { useEditorModels } from '@/composables/useEditorModels';
import CodeEditor from '@/components/code/code-editor.vue';
import { getFileDefFromFileName } from '@/components/code/code-utils';

const tabs = useTabs();
const editorModels = useEditorModels();
const theme = useTheme();

const currentUri = ref<string | null>(null);

type CodeEditorType = InstanceType<typeof CodeEditor>;
const codeEditor = useTemplateRef<CodeEditorType>('editor');

const highlightColor = computed(() => theme.global.current.value.colors.primary);

const editorType = computed(() => {
  if (!currentUri.value) return null;
  const { path } = editorModels.parseUri(currentUri.value);
  const fileDef = getFileDefFromFileName(path);
  return fileDef.editor || 'code';
});

const isMedia = computed(() => ['image', 'video', 'audio'].includes(editorType.value || ''));

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
    currentUri.value = editorModels.getUriString(projectId, path);

    if (editorType.value === 'code') {
      setTimeout(() => {
        if (range) {
          codeEditor.value?.editorRef?.revealRangeInCenter(range);
          codeEditor.value?.editorRef?.setSelection(range);
          tabs.clearRange(tabs.currentTab!);
        }
      }, 100);
    }
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
    v-show="editorType === 'code'"
    :uri="currentUri"
    :highlight-color="highlightColor"
    style="height: calc(100% - 1px);"
    ref="editor"
  />
  <media-view
    v-show="isMedia"
    :uri="isMedia ? currentUri : null"
    :type="editorType as 'image' | 'video' | 'audio'"
  />
  <rich-editor
    v-show="editorType === 'rich-text'"
    :uri="editorType === 'rich-text' ? currentUri : null"
  />
</template>

