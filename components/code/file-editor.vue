<script setup lang="ts">
import { getContentTypeFromFileName, getLanguageFromContentType } from './code-utils.ts';

const tabs = useTabs();
const projects = useProjects();

const pathContentCache = ref(new Map<string, string>());
const pathsToSave = ref(new Set<string>());
const writeTimeout = ref<NodeJS.Timeout | null>(null);
const loading = ref(false);

const currentTabId = computed(() => tabs.currentTab?.id);
const pathContent = computed(() => pathContentCache.value.get(tabs.currentTab?.path || '') || '');
const language = computed(() => getLanguageFromContentType(getContentTypeFromFileName(tabs.currentTab?.path || '')));
// const editorRef = computed(() => `${tabs.currentTab?.projectId}/${tabs.currentTab?.path}`);

const loadFileContent = async (path: string) => {
  if (tabs.currentTab?.type !== 'file') return;
  if (!projects.storage) return;
  loading.value = true;
  const content = await projects.storage.readFile(path);
  loading.value = false;
  pathContentCache.value.set(path, content);
};

const savePaths = async () => {
  const paths = Array.from(pathsToSave.value);
  pathsToSave.value.clear();
  await Promise.all(paths.map((path) => projects.storage?.writeFile(path, pathContentCache.value.get(path) || '')));
  if (!pathsToSave.value.size) projects.removeVolatileAction('file-editor:savePath');
};

const savePath = (path: string, content: string) => {
  projects.addVolatileAction('file-editor:savePath');
  pathContentCache.value.set(path, content);
  pathsToSave.value.add(path);
  if (writeTimeout.value) clearTimeout(writeTimeout.value);
  writeTimeout.value = setTimeout(savePaths, 500);
};

watch(currentTabId, async () => {
  if (tabs.currentTab?.type !== 'file') return;
  await loadFileContent(tabs.currentTab.path!);
}, { immediate: true });

</script>

<template>
  <v-progress-linear
    :style="{ opacity: loading ? 1 : 0 }"
    indeterminate
    color="primary"
    height="1"
  />
  <code-editor
    :model-value="pathContent"
    :language="language"
    style="height: calc(100% - 1px);"
    @update:model-value="savePath(tabs.currentTab?.path!, $event)"
  />
</template>
