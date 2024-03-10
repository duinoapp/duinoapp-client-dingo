<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { PathMap } from '@duinoapp/files-multitool';
import type { FileItem } from './directory-area';
import { getContentTypeFromFileName, getIconFromContentType, getIconColorFromContentType } from '../code/code-utils.ts';

const projects = useProjects();
const theme = useTheme();
const tabs = useTabs();

const darkMode = computed(() => theme.global.current.value.dark);

const pathMap = ref<PathMap | null>(null);
const selectedPath = ref<string | null>(null);

const fileItems = computed(() => {
  if (!pathMap.value) return [];
  const itemsByDir = new Map<string, FileItem[]>();
  Object.entries(pathMap.value).forEach(([path, stat]) => {
    const parts = path.split('/');
    const name = parts.pop()!;
    const dir = parts.join('/');
    const contentType = getContentTypeFromFileName(name);
    const icon = getIconFromContentType(contentType);
    const iconColor = getIconColorFromContentType(contentType, darkMode.value);
    const item: FileItem = {
      name,
      path,
      stat,
      icon,
      iconColor,
      children: [],
    };
    const fis = itemsByDir.get(dir) || [];
    fis.push(item);
    itemsByDir.set(dir, fis);
  });
  const popChildren = (dir: string) => {
    const fis = itemsByDir.get(dir) || [];
    fis.forEach((fi) => {
      if (fi.stat.isDirectory) {
        // eslint-disable-next-line no-param-reassign
        fi.children = popChildren(fi.path);
      }
    });
    return fis;
  };
  popChildren('');
  const items = itemsByDir.get('') || [];
  return items;
});

const loadPathMap = async () => {
  if (!projects.storage) return;
  pathMap.value = await projects.storage.list('/', true);
};

const handlePathChange = () => {
  loadPathMap();
};

const currentProjectId = computed(() => projects.currentProjectId);
const currentStorage = ref(projects.storage);
watch(currentProjectId, () => {
  loadPathMap();
  if (currentStorage.value) {
    currentStorage.value.off?.('paths-changed', handlePathChange);
  }
  projects.storage?.on('paths-changed', handlePathChange);
  currentStorage.value = projects.storage;
}, { immediate: true });

onBeforeUnmount(() => {
  projects.storage?.off('paths-changed', handlePathChange);
});

const currentTabId = computed(() => tabs.currentTab?.id || null);
watch(currentTabId, () => {
  if (tabs.currentTab?.type === 'file' && typeof tabs.currentTab.path === 'string') {
    selectedPath.value = tabs.currentTab.path;
  }
}, { immediate: true });

const handleSelect = (path: string) => {
  const fileStat = pathMap.value?.[path];
  if (!fileStat) return;
  if (!fileStat.isDirectory) {
    tabs.openFileTab(path);
  }
  selectedPath.value = path;
};

</script>

<template>
  <div class="dir-area">
    {{ projects.currentProject?.id }}<br>
    {{ tabs.currentTab?.path }}
    <directory-list-item
      v-for="child in fileItems"
      :key="child.path"
      :item="child"
      :selected-path="selectedPath"
      :depth="1"
      @update:selected-path="handleSelect"
    />
  </div>
</template>

<style scoped>

.dir-area {
  padding: 8px 0px;
  overflow-y: auto;
  height: 100%;
}
</style>
