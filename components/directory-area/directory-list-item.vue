<script setup lang="ts">
import type { FileItem } from './directory-area.d';

const props = defineProps<{
  item: FileItem,
  selectedPath: string | null,
  depth: number,
}>();

const isSelectedInChildren = (item: FileItem): boolean => {
  if (item.path === props.selectedPath) return true;
  return !!item.children?.some(isSelectedInChildren);
};
const showChildren = ref(isSelectedInChildren(props.item));

const isSelected = computed(() => {
  if (props.item.stat.isDirectory && isSelectedInChildren(props.item)) {
    return !showChildren.value;
  }
  return props.selectedPath === props.item.path;
});
const children = computed(() => props.item.children);
const folderIcon = computed(() => (showChildren.value ? 'mdi-chevron-down' : 'mdi-chevron-right'));

const emit = defineEmits(['update:selectedPath']);

watch(() => props.selectedPath, () => {
  if (isSelectedInChildren(props.item)) {
    showChildren.value = true;
  }
});

const handleSelect = () => {
  if (props.item.stat.isDirectory) {
    showChildren.value = !showChildren.value;
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
    <div class="dir-list-item-name" :style="{ paddingLeft: `${depth * 8}px` }">
      <v-icon
        :color="item.iconColor"
        size="x-small"
      >
        {{ item.stat.isFile ? item.icon : folderIcon }}
      </v-icon>
      {{ item.name }}
    </div>
    <div v-if="children.length" v-show="showChildren" class="dir-list-item-children">
      <directory-list-item
        v-for="child in children"
        :key="child.path"
        :item="child"
        :selected-path="selectedPath"
        :depth="depth + 1"
        @update:selected-path="$emit('update:selectedPath', $event)"
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
</style>
