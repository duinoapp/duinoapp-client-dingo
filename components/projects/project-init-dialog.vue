<script setup lang="ts">
import type { FilesMultitoolType } from '@duinoapp/files-multitool';
import { typeToIcon } from '@/utils/project-display';
import startCase from 'lodash/startCase';
import { projectNameRules, validateRules } from './project-utils';

const projects = useProjects();
const { panelState } = usePanels();

const storageType = ref(null as FilesMultitoolType | null);
const projectName = ref('');
const projectFile = ref(null as File | null);
const loading = ref(false);
const errored = ref(false);
const storageRequired = ref(false);

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
const showProjectName = computed(() => !['open'].includes(projects.dialog.type));
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
    storageRequired.value = false;
    storageType.value = null;
    projectName.value = '';
    if (template.value) {
      projectName.value = template.value.name;
    } else if (projects.dialog.type === 'library') {
      const fileName = projects.dialog.inoFileName?.split('/').pop()?.replace('.ino', '');
      const ref = projects.dialog.ref?.split('@')[0];
      projectName.value = `${startCase(ref?.replace(/\d/g, ''))} - ${startCase(fileName)}`;
    }
  }
}, { immediate: true });

watch(projectFile, (to, from) => {
  const fileToProjectName = (file: File) => startCase(file.name.split('.').slice(0, -1).join(' '));
  if (from && projectName.value === fileToProjectName(from)) {
    projectName.value = '';
  }
  if (to && !projectName.value) {
    projectName.value = fileToProjectName(to);
  }
});

const submit = async () => {
  if (!storageType.value) {
    storageRequired.value = true;
    return;
  }
  if (showProjectName.value && !validateRules(projectNameRules, projectName.value)) return;
  loading.value = true;
  errored.value = false;
  try {
    if (projects.dialog.type === 'open') {
      await projects.openProject(storageType.value);
    } else if (projects.dialog.type === 'import') {
      if (!projectFile.value) {
        loading.value = false;
        return;
      }
      await projects.importProject(storageType.value, projectFile.value, projectName.value);
    } else if (projects.dialog.type === 'example') {
      await projects.projectFromTemplate(storageType.value, projects.dialog.ref, projectName.value);
    } else if (projects.dialog.type === 'library') {
      await projects.importLibraryProject(storageType.value, projects.dialog.ref, projects.dialog.inoFileName, projectName.value);
    } else {
      await projects.createProject(storageType.value, projectName.value);
    }
    projects.dialog.open = false;
    panelState.leftPanelType = 'explore';
  } catch (e) {
    console.error(e);
    errored.value = true;
  } finally {
    loading.value = false;
  }
};

const close = () => {
  projects.dialog.open = false;
  if (projects.dialog.onCancel) {
    projects.dialog.onCancel();
  }
};

</script>

<template>
  <v-dialog v-model="projects.dialog.open" max-width="500">
    <v-card :title="title">
      <v-card-text>
        <v-alert
          v-if="errored"
          type="error"
          variant="tonal"
          class="mb-2"
          text="An error occurred while trying to create the project, please try again."
        />
        <div class="text-h8 mb-2" :class="{ 'text-error': storageRequired }">
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
            <!-- Cloud storage is the safest and most portable, but can be slow and requires an active internet connection. -->
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
        <v-file-input
          v-if="showFileInput"
          v-model="projectFile"
          label="Project zip file"
          variant="outlined"
        />
        <v-text-field
          v-if="showProjectName"
          v-model="projectName"
          label="Project name"
          :rules="projectNameRules"
          variant="outlined"
          hide-details="auto"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Cancel
        </v-btn>
        <btn-primary
          :loading="loading"
          @click="submit"
        >
          {{ title.split(' ')[0] }}
        </btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>