<script setup lang="ts">
import { useFileActions } from '@/composables/useFileActions';
import { fileNameRules, validateRules } from './file-utils';

const fileActions = useFileActions();

const dialog = computed(() => fileActions.dialog);
const loading = ref(false);

const fileName = ref('');
const fileExtension = ref('');
const selectedPath = ref('');

const fullFileName = computed(() => `${fileName.value}.${fileExtension.value}`);

const isMove = computed(() => dialog.value.type === 'move');
const isRename = computed(() => dialog.value.type === 'rename');
const isCreate = computed(() => dialog.value.type === 'create');
const isDelete = computed(() => dialog.value.type === 'delete');

const showPath = computed(() => isMove.value || isCreate.value);
const showName = computed(() => isRename.value || isCreate.value);
const showExtension = computed(() => showName.value && dialog.value.actionType === 'file');

const hasFile = computed(() => isCreate.value && dialog.value.actionType === 'file' && dialog.value.file);

watch(() => dialog.value.name, (newName = '') => {
  if (dialog.value.actionType === 'file') {
    const [name, extension] = newName.split('.');
    fileName.value = name;
    fileExtension.value = extension || 'cpp';
  } else {
    fileName.value = newName;
  }
}, { immediate: true });

watch(() => dialog.value.parentPath, (newParentPath = '') => {
  selectedPath.value = newParentPath;
}, { immediate: true });

const title = computed(() => {
  switch (dialog.value.type) {
    case 'create': return `Create ${dialog.value.actionType}`;
    case 'rename': return `Rename ${dialog.value.actionType}`;
    case 'move': return `Move ${dialog.value.actionType}`;
    case 'delete': return `Delete ${dialog.value.actionType}`;
    default: return '';
  }
});

const handleSubmit = async () => {
  if (loading.value) return;
  if (showName.value && !validateRules(fileNameRules, fileName.value)) return;
  loading.value = true;
  
  try {
    switch (dialog.value.type) {
      case 'create':
        if (dialog.value.actionType === 'file') {
          if (dialog.value.file) {
            const content = await dialog.value.file.arrayBuffer();
            await fileActions.createFile(dialog.value.parentPath!, fullFileName.value, content);
          } else {
            await fileActions.createFile(dialog.value.parentPath!, fullFileName.value);
          }
        } else {
          await fileActions.createFolder(dialog.value.parentPath!, fileName.value);
        }
        break;
      case 'rename':
        const name = dialog.value.actionType === 'file' ? fullFileName.value : fileName.value;
        await fileActions.rename(dialog.value.path!, name);
        break;
      case 'move':
        if (selectedPath.value === dialog.value.parentPath) {
          return;
        }
        await fileActions.move(dialog.value.path!, selectedPath.value);
        break;
      case 'delete':
        await fileActions.remove(dialog.value.path!, dialog.value.actionType === 'folder');
        break;
    }
    fileActions.closeDialog();
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-dialog
    :model-value="!!dialog.type"
    @update:model-value="fileActions.closeDialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <div v-if="hasFile" class="mb-4 text-center">
          <v-icon color="primary">mdi-shark-fin-outline</v-icon>
          Oh no! Bob turned into a shark!
          <br>
          Let's save the file to get it away from him!
        </div>
        <v-form @submit.prevent="handleSubmit">
          <div v-if="showName" class="text-caption mb-2">
            {{ selectedPath }}/{{ fullFileName }}
          </div>
          <v-row v-if="showPath || showName" align="center">
            <v-col v-if="showPath" cols="12">
              <directory-select
                v-model="selectedPath"
                :exclude-path="dialog.path"
                label="Path"
              />
            </v-col>
            <v-col v-if="showName" cols="12" :md="dialog.actionType === 'file' ? 8 : 12">
              <v-text-field
                v-model.trim="fileName"
                :label="dialog.actionType === 'file' ? 'File name' : 'Folder name'"
                :rules="fileNameRules"
              />
            </v-col>
            <v-col v-if="showExtension" cols="12" md="4">
              <extension-select
                v-model="fileExtension"
                label="File extension"
              />
            </v-col>
          </v-row>
          <v-alert
            v-if="isDelete"
            type="warning"
            variant="tonal"
          >
            Are you sure you want to delete this item? This action cannot be undone.
            <br>
            <code>{{ dialog.path }}</code>
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="fileActions.closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ dialog.type === 'delete' ? 'Delete' : 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template> 