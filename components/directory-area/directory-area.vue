<script setup lang="ts">
import { useTheme } from 'vuetify';
import sortBy from 'lodash/sortBy';
import type { PathMap, FileStat } from '@duinoapp/files-multitool';
import type { FileItem } from './directory-area';
import { getContentTypeFromFileName, getIconFromContentType, getIconColorFromContentType } from '../code/code-utils.ts';
import { useFileActions } from '@/composables/useFileActions';

const projects = useProjects();
const theme = useTheme();
const tabs = useTabs();

const darkMode = computed(() => theme.global.current.value.dark);

const pathMap = shallowRef<PathMap | null>(null);
const selectedPath = ref<string | null>(null);
const isDragging = ref(false);
const focusedPath = ref<string>('');
const collapsedMap = ref<Record<string, boolean | null>>({});

const sortedPathItems = computed(() => sortBy(
  Object.entries(pathMap.value || {}),
  [
    ([path, stat]: [string, FileStat]) => stat.isDirectory ? 0 : 1,
    ([path]: [string]) => path.toLowerCase(),
  ],
).filter(([path]) => !path.startsWith('.duinoapp')));

const fileItems = computed(() => {
  if (!pathMap.value) return [];
  const itemsByDir = new Map<string, FileItem[]>();
  sortedPathItems.value.forEach(([path, stat]) => {
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
      collapsed: collapsedMap.value[path] ?? true,
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

const paths = computed(() => {
  const itemFlattened = (item: FileItem): string[] => {
    return [item.path, ...item.children.map((child) => itemFlattened(child)).flat()];
  };
  return fileItems.value.map((item) => itemFlattened(item)).flat();
});

const setCollapsedMap = () => {
  sortedPathItems.value.forEach(([path, stat]) => {
    if (typeof collapsedMap.value[path] !== 'boolean') {
      collapsedMap.value[path] = stat.isDirectory ? true : null;
    }
  });
};

const loadPathMap = async () => {
  if (!projects.storage) return;
  pathMap.value = await projects.storage.list('/', true);
  setCollapsedMap();
};

const handlePathChange = useDebounceFn(() => {
  loadPathMap();
}, 500);

onMounted(() => {
  projects.on('paths-changed', handlePathChange);
  loadPathMap();
});

onBeforeUnmount(() => {
  projects.off('paths-changed', handlePathChange);
});

const currentProjectId = computed(() => projects.currentProjectId);
watch(currentProjectId, async () => {
  collapsedMap.value = {};
  await loadPathMap();
}, { immediate: true });

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
    selectedPath.value = path;
    focusedPath.value = path;
  } else {
    collapsedMap.value[path] = !collapsedMap.value[path];
  }
};

const fileActions = useFileActions();

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length === 0) return;
  
  // For now, just handle the first file
  const file = files[0];
  isDragging.value = false;
  fileActions.showCreateDialog('', 'file', file);
};

const timeout = useTimeoutFn(() => {
  isDragging.value = false;
}, 500);

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  timeout.stop();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  timeout.start();
};

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  timeout.stop();
  isDragging.value = true;
};

const triggerFocus = () => {
  if (!focusedPath.value) {
    focusedPath.value = paths.value[0];
  } else {
    handleSelect(focusedPath.value);
  }
};

const handleCollapse = ({ path, collapse }: { path: string, collapse: boolean }) => {
  collapsedMap.value[path] = collapse;
};

// implement this aria spec: https://www.w3.org/TR/wai-aria/#tree & https://www.w3.org/WAI/GL/wiki/Using_ARIA_trees
const isParentsCollapsed = (path: string) => {
  const parentPath = path.split('/').slice(0, -1).join('/');
  if (parentPath === '') return false;
  if (collapsedMap.value[parentPath] === true) {
    return true;
  }
  return isParentsCollapsed(parentPath);
};
const nextUnCollapsed = (index: number, direction: 'down' | 'up') => {
  const increment = direction === 'down' ? 1 : -1;
  for (let i = index; i < paths.value.length && i >= 0; i += increment) {
    if (!isParentsCollapsed(paths.value[i])) {
      return paths.value[i];
    }
  }
  return paths.value[0];
};
const handleDown = () => {
  let index = paths.value.indexOf(focusedPath.value) + 1;
  if (index >= paths.value.length) index = 0;
  focusedPath.value = nextUnCollapsed(index, 'down');
};
const handleUp = () => {
  let index = paths.value.indexOf(focusedPath.value) - 1;
  if (index < 0) index = paths.value.length - 1;
  focusedPath.value = nextUnCollapsed(index, 'up');
};
const handleLeft = () => {
  const parentPath = focusedPath.value.split('/').slice(0, -1).join('/');
  if (parentPath === '') return;
  focusedPath.value = parentPath;
  collapsedMap.value[parentPath] = true;
};
const handleRight = () => {
  if (collapsedMap.value[focusedPath.value] === true) {
    collapsedMap.value[focusedPath.value] = false;
    handleDown();
  }
};
const handleHome = () => {
  focusedPath.value = paths.value[0];
};
const handleEnd = () => {
  focusedPath.value = paths.value[paths.value.length - 1];
};
// numpad asterisk expands all collapsed directories
const handleAsterisk = () => {
  const direction = Object.values(collapsedMap.value).some((c) => c === true);
  collapsedMap.value = Object.fromEntries(
    Object.entries(collapsedMap.value)
      .map(([path, collapse]) => [path, collapse === direction ? !direction : collapse]),
  );
};

</script>

<template>
  <div>
    <div
      v-show="!!projects.currentProjectId"
      class="dir-area"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @contextmenu.stop="fileActions.handleContextMenu($event, '', true)"
    >
      <div v-show="!isDragging">
        <div
          class="d-flex align-center pa-2"
        >
          <div class="text-h6 text-truncate" :title="projects.currentProject?.name">
            {{ projects.currentProject?.name }}
          </div>
          <v-spacer />
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="mr-2"
            @click="fileActions.showCreateDialog('', 'file')"
          >
            <v-icon>mdi-file-plus</v-icon>
            <v-tooltip activator="parent" location="bottom">
              Create File
            </v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            @click="fileActions.showCreateDialog('', 'folder')"
          >
            <v-icon>mdi-folder-plus</v-icon>
            <v-tooltip activator="parent" location="bottom">
              Create Folder
            </v-tooltip>
          </v-btn>
        </div>
        <v-divider />
        <div
          role="tree"
          :tabindex="0"
          @keydown.enter.stop="triggerFocus"
          @keydown.space.stop="triggerFocus"
          @keydown.arrow-down.stop="handleDown"
          @keydown.arrow-up.stop="handleUp"
          @keydown.arrow-left.stop="handleLeft"
          @keydown.arrow-right.stop="handleRight"
          @keydown.home.stop="handleHome"
          @keydown.end.stop="handleEnd"
          @keydown.*.stop="handleAsterisk"
          @blur="focusedPath = ''"
        >
          <directory-list-item
            v-for="child in fileItems"
            ref="child"
            :key="child.path"
            :item="child" 
            :selected-path="selectedPath"
            :depth="1"
            :focused-path="focusedPath"
            @update:selected-path="handleSelect"
            @menu="(e: any) => fileActions.handleContextMenu(e.event, e.path, e.isDirectory)"
            @collapse="handleCollapse"
          />
        </div>
      </div>
      <div v-show="isDragging">
        <div class="pa-2 text-center">
          <div class="text-h5 mb-4">Drop a file here</div>
          <v-icon size="80" color="primary">mdi-fishbowl-outline</v-icon>
          <div class="text-caption mt-2">
            This is our fish bob.
            <br>
            He likes to eat yummy files.
            <br>
            Drop a file here to feed him.
            <br>
            He will eat it and turn it into code.
            <br>
            Or at least try to.
          </div>
        </div>
      </div>
    </div>
    <div v-show="!projects.currentProjectId">
      <div class="pa-2">
        <div class="text-h6 mb-4">Project Files</div>
        <div class="text-caption text-center">
          No project selected.
          <br>
          Open/create a project to start editing.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.dir-area {
  padding: 8px 0px;
  overflow-y: auto;
  height: 100vh;
}
</style>
