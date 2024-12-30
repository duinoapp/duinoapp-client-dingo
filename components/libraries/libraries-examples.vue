<script setup lang="ts">
import { getProjectInoFilesFromUrl } from '@/utils/import-project';

const props = withDefaults(defineProps<{
  library?: Library,
}>(), {
  library: undefined,
});

const { initDialog } = useProjects();

const fileNames = ref<string[]>([]);
const loading = ref(false);
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
  fileNames.value = await getProjectInoFilesFromUrl(libUrl.value);
  loading.value = false;
};

watch(libUrl, loadFiles, { immediate: true });

</script>

<template>
  <v-progress-linear
    :style="{ opacity: loading ? 1 : 0 }"
    indeterminate
    color="primary"
  />
  <v-list>
    <v-list-item
      v-for="fileName in fileNames"
      :key="fileName"
      @click="openLibraryExample(fileName)"
    >
      <v-list-item-title>
        {{ fileName.replace('.ino', '')}}
      </v-list-item-title>
    </v-list-item>
  </v-list>
  <div v-if="!fileNames.length && !loading" class="text-center text-caption">
    No examples found for this library.
  </div>
</template>