<script setup lang="ts">
import type { FilesMultitoolType } from '@duinoapp/files-multitool';
import { typeToIcon } from '@/utils/project-display';

const {
  dialog,
  storageItems,
  starterTemplates,
  createProject,
  openProject,
  projectFromTemplate,
  importProject,
} = useProjects();
const { panelState } = usePanels();

const storageType = ref(null as FilesMultitoolType | null);
const projectName = ref('');
const projectFile = ref(null as File | null);
const loading = ref(false);

const title = computed(() => {
  switch (dialog.type) {
    case 'create':
      return 'Create a new project';
    case 'open':
      return 'Open a project';
    case 'import':
      return 'Import a project';
    case 'example':
      return 'Create a new project from example';
    default:
      return 'Project action';
  }
});

const template = computed(() => dialog.type === 'example' ? starterTemplates[dialog.ref] : null);

const showProjectName = computed(() => !['open', 'import'].includes(dialog.type));

const showFileInput = computed(() => dialog.type === 'import');

const selectableStorage = computed(() => {
  if (dialog.type === 'open') {
    return storageItems.filter((item) => item.value !== 'indexed-db');
  }
  return storageItems;
});

watch(dialog, () => {
  if (dialog.open) {
    storageType.value = null;
    projectName.value = '';
    if (template.value) {
      projectName.value = template.value.name;
    }
  }
});

const submit = async () => {
  if (!storageType.value) return;
  if (showProjectName.value && !projectName.value) return;
  loading.value = true;
  if (dialog.type === 'open') {
    await openProject(storageType.value);
  } else if (dialog.type === 'import') {
    if (!projectFile.value) {
      loading.value = false;
      return;
    }
    await importProject(storageType.value, projectFile.value);
  } else if (dialog.type === 'example') {
    await projectFromTemplate(storageType.value, dialog.ref, projectName.value);
  } else {
    await createProject(storageType.value, projectName.value);
  }
  loading.value = false;
  dialog.open = false;
  panelState.leftPanelType = 'explore';
};

</script>

<template>
  <v-dialog v-model="dialog.open" max-width="500">
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
          @click="dialog.open = false"
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