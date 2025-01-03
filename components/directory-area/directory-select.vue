<script setup lang="ts">
import type { FileStat } from '@duinoapp/files-multitool';

const props = defineProps<{
  label: string;
  excludePath?: string;
}>();

const modelValue = defineModel<string>();

const projects = useProjects();

const loading = ref(false);
const items = ref<{ title: string; value: string }[]>([]);

const loadItems = async () => {
  if (!projects.storage) return;
  loading.value = true;
  const pathMap = await projects.storage.list('/', true);
  items.value = Object.entries(pathMap)
    .filter(([path, stat]: [string, FileStat]) => stat.isDirectory && !path.startsWith('.duinoapp'))
    .map(([path]) => ({ title: `/${path}`, value: path }))
    .sort();
  items.value.unshift({ title: '/ (project root)', value: '' });
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
