<script setup lang="ts">

const projects = useProjects();

const loading = ref(false);

const exportProject = async () => {
  if (!projects.currentProject) return;
  loading.value = true;
  try {
    const file = await projects.exportCurrentProject();
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
      loading.value = false;
    }, 1000);
  } catch (e) {
    console.error(e);
    loading.value = false;
  }
};

</script>

<template>
  <v-btn
    :loading="loading"
    variant="tonal"
    prepend-icon="mdi-folder-download-outline"
    v-bind="$attrs"
    @click="exportProject"
  >
    Export Project
  </v-btn>
</template>
