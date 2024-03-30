<script setup lang="ts">
import type { FilesMultitoolType } from '@duinoapp/files-multitool';
import { typeToIcon } from '@/utils/project-display';
import startCase from 'lodash/startCase';

const projects = useProjects();
const { panelState } = usePanels();

const storageType = ref(null as FilesMultitoolType | null);
const projectName = ref('');
const projectFile = ref(null as File | null);
const loading = ref(false);

const title = computed(() => {
  switch (projects.dialog.type) {
    case 'create':
      return 'Create a new project';
    case 'open':
      return 'Open a project';
    case 'import':
      return 'Import a project';
    case 'example':
      return 'Create a new project from example';
    case 'library':
      return `Add a library example ${projects.dialog.inoFileName?.split('.')[0]}`;
    default:
      return 'Project action';
  }
});

const template = computed(() => projects.dialog.type === 'example' ? starterTemplates[projects.dialog.ref] : null);
const showProjectName = computed(() => !['open', 'import'].includes(projects.dialog.type));
const showFileInput = computed(() => projects.dialog.type === 'import');
const selectableStorage = computed(() => {
  if (projects.dialog.type === 'open') {
    return projects.storageItems.filter((item) => item.value !== 'indexed-db');
  }
  return projects.storageItems;
});
const open = computed(() => projects.dialog.open);

watch(open, () => {
  if (projects.dialog.open) {
    storageType.value = null;
    projectName.value = '';
    if (template.value) {
      projectName.value = template.value.name;
    } else if (projects.dialog.type === 'library') {
      projectName.value = startCase(projects.dialog.inoFileName?.split('.')[0] || '');
    }
  }
}, { immediate: true });

const submit = async () => {
  if (!storageType.value) return;
  if (showProjectName.value && !projectName.value) return;
  loading.value = true;
  if (projects.dialog.type === 'open') {
    await projects.openProject(storageType.value);
  } else if (projects.dialog.type === 'import') {
    if (!projectFile.value) {
      loading.value = false;
      return;
    }
    await projects.importProject(storageType.value, projectFile.value);
  } else if (projects.dialog.type === 'example') {
    await projects.projectFromTemplate(storageType.value, projects.dialog.ref, projectName.value);
  } else if (projects.dialog.type === 'library') {
    await projects.importLibraryProject(storageType.value, projects.dialog.ref, projects.dialog.inoFileName, projectName.value);
  } else {
    await projects.createProject(storageType.value, projectName.value);
  }
  loading.value = false;
  projects.dialog.open = false;
  panelState.leftPanelType = 'explore';
};

</script>

<template>
  <v-dialog v-model="projects.dialog.open" max-width="500">
    <v-card :title="title">
      <v-card-text>
        <div class="text-h8 mb-2">
          Select storage type:
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-icon x-small v-bind="props">
                mdi-information-outline
              </v-icon>
            </template>
            Choose where to keep the project files.<br>
            Browser storage is easiest to use, but can be volatile.<br>
            The computer's file system is generally more reliable, but can be more annoying to manage.<br>
            Cloud storage is the safest and most portable, but can be slow and requires an active internet connection.
          </v-tooltip>
        </div>
        <v-row align="center" class="mb-2">
          <v-col
            v-for="item in selectableStorage"
            :key="item.value"
            cols="6"
          >
            <v-btn
              @click="storageType = item.value"
              :color="storageType === item.value ? 'primary' : undefined"
              :prepend-icon="typeToIcon(item.value)"
              variant="tonal"
              stacked
            >
              {{ item.text }}
            </v-btn>
          </v-col>
        </v-row>
        <v-text-field
          v-if="showProjectName"
          v-model="projectName"
          label="Project name"
          outlined
          dense
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="projects.dialog.open = false"
        >
          Cancel
        </v-btn>
        <v-btn
          :loading="loading"
          variant="tonal"
          color="primary"
          @click="submit"
        >
          {{ title.split(' ')[0] }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>