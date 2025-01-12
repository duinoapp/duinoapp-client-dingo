<script setup lang="ts">
import { getInoFilesFromUrl } from '@/utils/project-importer';

const props = withDefaults(defineProps<{
  library?: Library,
}>(), {
  library: undefined,
});

const { initDialog } = useProjects();

const fileNames = ref<string[]>([]);
const loading = ref(false);
const errored = ref(false);
const libUrl = computed(() => props.library?.resources?.url);

const emit = defineEmits(['close']);

const openLibraryExample = (fileName: string) => {
  initDialog('library', {
    ref: `${props.library?.name}@latest`,
    inoFileName: fileName,
  });
  emit('close');
};

const loadFiles = async () => {
  if (!libUrl.value) return;
  loading.value = true;
  try {
    fileNames.value = await getInoFilesFromUrl(libUrl.value);
  } catch (e) {
    errored.value = true;
  } finally {
    loading.value = false;
  }
};

watch(libUrl, loadFiles, { immediate: true });

</script>

<template>
  <v-progress-linear
    :style="{ opacity: loading ? 1 : 0 }"
    indeterminate
    color="primary"
  />
  <v-alert
    v-if="errored"
    type="error"
    variant="tonal"
    text="Failed to load examples. Please try again later."
  />
  <div v-else-if="!fileNames.length && !loading" class="text-center text-caption">
    No examples found for this library.
  </div>
  <v-list v-else-if="!loading">
    <v-list-item
      v-for="fileName in fileNames"
      :key="fileName"
      :title="fileName.split('/').pop()?.replace('.ino', '')"
      :subtitle="fileName.split('/').slice(0, -1).join('/')"
      @click="openLibraryExample(fileName)"
    />
  </v-list>
</template>