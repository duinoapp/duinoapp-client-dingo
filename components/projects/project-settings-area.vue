<script setup lang="ts">
import { projectNameRules, validateRules } from './project-utils';

const projects = useProjects();
const projectName = ref('');
const projectAuthor = ref('');

watchDebounced(projectName, (value) => {
  if (validateRules(projectNameRules, value)) {
    projects.renameProject(value);
  }
}, { debounce: 500 });

watchDebounced([projectAuthor], () => {
  projects.updateSettings({
    author: projectAuthor.value,
  });
}, { debounce: 500 });

watch(() => projects.currentProjectId, (value) => {
  if (!value) return;
  projectName.value = projects.currentProject?.name ?? '';
  projectAuthor.value = projects.currentProject?.settings?.author ?? '';
}, { immediate: true });

</script>

<template>
  <v-container>
    <v-form>
      <v-text-field
        v-model="projectName"
        :rules="projectNameRules"
        label="Project Name"
      />
      <v-text-field
        v-model="projectAuthor"
        label="Author"
      />
    </v-form>
  </v-container>
</template>
