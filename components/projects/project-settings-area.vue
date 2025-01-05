<script setup lang="ts">
import { projectNameRules, validateRules } from './project-utils';

const projects = useProjects();
const tabs = useTabs();
const serial = useSerial();

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
  projectName.value = projects.settings?.name ?? '';
  projectAuthor.value = projects.settings?.author ?? '';
}, { immediate: true });


const encodingOptions = [
  { value: 'utf8', label: 'UTF-8 (unicode + emojis)' },
  { value: 'ascii', label: 'ASCII' },
  { value: 'utf16le', label: 'UTF-16 LE' },
  { value: 'ucs2', label: 'UCS-2' },
  { value: 'base64', label: 'Base64' },
  { value: 'hex', label: 'Hex' },
  { value: 'latin1', label: 'Latin1' },
];
</script>

<template>
  <div class="settings-area">
    <div class="settings-form">
      <h1>Project Settings</h1>
      
      <div class="settings-section">
        <h2>General</h2>
        <div class="setting-item">
          <label>Project Name</label>
          <v-text-field
            v-model="projectName"
            :rules="projectNameRules"
            density="compact"
            hide-details
            variant="outlined"
          />
        </div>

        <div class="setting-item">
          <label>Author</label>
          <v-text-field
            v-model="projectAuthor"
            density="compact"
            hide-details
            variant="outlined"
          />
        </div>
      </div>

      <div class="settings-section">
        <h2>Serial Monitor</h2>
        <div class="setting-item">
          <label>Encoding</label>
          <v-select
            v-model="serial.encoding"
            :items="encodingOptions"
            item-title="label"
            item-value="value"
            density="compact"
            hide-details
            variant="outlined"
          />
        </div>

        <div class="setting-item">
          <label>Baud Rate</label>
          <v-select
            v-model="serial.baudRate"
            :items="serial.baudRateItems"
            density="compact"
            hide-details
            variant="outlined"
          />
        </div>
      </div>

      <div class="settings-section">
        <v-btn
          variant="tonal"
          prepend-icon="mdi-cog-outline"
          @click="tabs.addTab({ type: 'settings', name: 'Settings' })"
        >
          Global Settings
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-area {
  display: flex;
  flex-direction: row;
  height: 100%;

  .settings-form {
    padding: 20px;
    height: 100%;
    min-width: 440px;
    width: 100%;
    overflow-y: auto;
  }
}

.settings-section {
  margin-bottom: 32px;
}

.setting-item {
  padding: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  .v-input {
    max-width: 400px;
  }

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.05);
  }
}

.setting-item label {
  min-width: 200px;
}

h1 {
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 15px;
  color: var(--color-heading);
}
</style>
