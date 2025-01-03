<script setup lang="ts">
import type { FileItem } from './directory-area.d';

const props = defineProps<{
  item: FileItem,
  selectedPath: string | null,
  depth: number,
  focusedPath: string,
}>();

const isSelectedInChildren = (item: FileItem): boolean => {
  if (item.path === props.selectedPath) return true;
  return !!item.children?.some(isSelectedInChildren);
};
const showChildren = computed(() => {
  if (props.item.stat.isDirectory) {
    return props.item.collapsed !== true;
  }
  return false;
});

const isSelected = computed(() => {
  if (props.item.stat.isDirectory && isSelectedInChildren(props.item)) {
    return !showChildren.value;
  }
  return props.selectedPath === props.item.path;
});
const children = computed(() => props.item.children);
const folderIcon = computed(() => (showChildren.value ? 'mdi-chevron-down' : 'mdi-chevron-right'));
const hasFocus = computed(() => props.focusedPath === props.item.path);

const emit = defineEmits(['update:selectedPath', 'menu', 'collapse']);

watch(() => props.selectedPath, () => {
  if (isSelectedInChildren(props.item)) {
    emit('collapse', { path: props.item.path, collapse: false });
  }
});

const handleSelect = () => {
  if (props.item.stat.isDirectory) {
    emit('collapse', { path: props.item.path, collapse: !showChildren.value });
  } else {
    emit('update:selectedPath', props.item.path);
  }
};

</script>

<template>
  <div
    :class="{ 'dir-list-item': true, 'dir-list-item-active': isSelected }"
    @click.stop="handleSelect"
  >
    <div
      :class="{ 'dir-list-item-name': true, 'dir-list-item-name-focused': hasFocus }"
      :style="{ paddingLeft: `${depth * 8}px` }"
      role="treeitem"
      ref="item"
      :aria-expanded="children.length ? showChildren : undefined"
      :aria-level="depth"
      :aria-selected="isSelected"
      @contextmenu.stop="$emit('menu', { event: $event, path: item.path, isDirectory: item.stat.isDirectory })"
    >
      <v-icon
        :color="item.iconColor"
        size="x-small"
      >
        {{ item.stat.isFile ? item.icon : folderIcon }}
      </v-icon>
      {{ item.name }}
    </div>
    <div v-if="children.length" v-show="showChildren" class="dir-list-item-children" role="group">
      <directory-list-item
        v-for="child in children"
        ref="child"
        :key="child.path"
        :item="child"
        :selected-path="selectedPath"
        :depth="depth + 1"
        :focused-path="focusedPath"
        @update:selected-path="$emit('update:selectedPath', $event)"
        @collapse="$emit('collapse', $event)"
        @menu="$emit('menu', $event)"
      />
    </div>
  </div>
</template>

<style scoped>

.dir-list-item {
  cursor: pointer;
  user-select: none;
}

.dir-list-item-name {
  border: 1px solid transparent;
  transition: background-color 0.1s ease-in-out;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.dir-list-item-name:hover {
  background-color: rgba(255,255, 255, 0.1);
}

.dir-list-item-active > .dir-list-item-name {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border: 1px solid rgba(var(--v-theme-primary), 0.8);
}

.dir-list-item-name-focused {
  background-color: rgba(var(--v-theme-info), 0.3);
  border: 1px solid rgba(var(--v-theme-info), 0.8);
}
</style>
