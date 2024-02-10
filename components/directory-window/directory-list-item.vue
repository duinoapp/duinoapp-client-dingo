<script setup lang="ts">
import type { FileItem } from './directory-window';

const props = defineProps<{
  item: FileItem,
  selectedPath: string | null,
}>();

const isSelected = computed(() => props.selectedPath === props.item.path);

const children = computed(() => props.item.children);

defineEmits(['update:selectedPath']);

</script>

<template>
  <div
    :class="{ 'dir-list-item': true, 'dir-list-item-active': isSelected }"
    @click.stop="$emit('update:selectedPath', item.path)"
  >
    <div class="dir-list-item-name">
      {{ item.name }}
    </div>
    <div v-if="children.length" class="ml-4 dir-list-item-children">
      <directory-list-item
        v-for="child in children"
        :key="child.path"
        :item="child"
        :selected-path="selectedPath"
        @update:selected-path="$emit('update:selectedPath', $event)"
      />
    </div>
  </div>
</template>

<style scoped>

.dir-list-item {
  padding: 4px 0px;
  cursor: pointer;
}

.dir-list-item-active > .dir-list-item-name {
  background-color: #f0f0f055;
}
</style>
