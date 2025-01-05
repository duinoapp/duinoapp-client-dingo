<script setup lang="ts">
import type { FileStat } from '@duinoapp/files-multitool';

const props = defineProps<{
  label: string;
  excludePath?: string;
  type?: 'folder' | 'file';
}>();

const modelValue = defineModel<string | null>({ default: null });

const projects = useProjects();

const loading = ref(false);
const items = ref<{ title: string; value: string }[]>([]);

const loadItems = async () => {
  if (!projects.storage) return;
  loading.value = true;
  const pathMap = await projects.storage.list('/', true);
  items.value = Object.entries(pathMap)
    .filter(([path, stat]: [string, FileStat]) => {
      if (path.startsWith('.duinoapp')) return false;
      if (props.type === 'folder') return stat.isDirectory;
      if (props.type === 'file') return stat.isFile;
      return true;
    })
    .map(([path]) => ({ title: `/${path}`, value: path }))
    .sort();
  if (props.type === 'folder') {
    items.value.unshift({ title: '/ (project root)', value: '' });
  }
  if (props.excludePath) {
    items.value = items.value.filter((item) => item.value !== props.excludePath);
  }
  loading.value = false;
};

onMounted(loadItems);
</script>

<template>
  <v-select
    v-model="modelValue"
    :items="items"
    :label="label"
  />
</template>
