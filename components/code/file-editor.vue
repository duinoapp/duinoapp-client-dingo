<script setup lang="ts">
import { useEditorModels, getUriString } from '@/composables/useEditorModels';

const tabs = useTabs();
const editorModels = useEditorModels();

const currentUri = ref<string | null>(null);

// Load model when tab changes
watch([() => tabs.currentTab?.projectId, () => tabs.currentTab?.path], async ([projectId, path]) => {
  currentUri.value = null; // Clear URI while loading
  
  if (!projectId || !path || tabs.currentTab?.type !== 'file') return;
  
  // make sure we aren't racing with file system events
  await editorModels.waitUntilReady(true);

  const model = await editorModels.getModel(projectId, path, true);
  if (model) {
    // Only set URI after model is loaded
    currentUri.value = getUriString(projectId, path);
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
    style="height: calc(100% - 1px);"
  />
</template>
