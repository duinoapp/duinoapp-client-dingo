<script setup lang="ts">
import { useSettings } from '~/composables/useSettings';
import { VNumberInput } from 'vuetify/labs/components';

const settings = useSettings();
const tabs = useTabs();

const advancedSettings = ref(false);

const lineNumberOptions = [
  { label: 'On', value: 'on' },
  { label: 'Off', value: 'off' },
  { label: 'Relative', value: 'relative' },
];

const wordWrapOptions = [
  { label: 'Off', value: 'off' },
  { label: 'On', value: 'on' },
  { label: 'Column', value: 'wordWrapColumn' },
  { label: 'Bounded', value: 'bounded' },
];
</script>

<template>
  <div class="settings-area">
    <div class="settings-form">
      <h1 class="d-flex justify-space-between align-center">
        Settings
        <v-btn
          @click="settings.resetSettings"
          :disabled="settings.isDefaultSettings"
          size="small"
          variant="flat"
          prepend-icon="mdi-undo-variant"
        >
          Restore Default
        </v-btn>
      </h1>
      
      <div class="settings-section">
        <h2>Code Editor</h2>
        <div class="setting-item">
          <label>Theme</label>
          <v-select
            :model-value="settings.settings.editor?.theme ?? 'vs-dark'"
            :items="settings.editorThemes"
            item-title="label"
            item-value="value"
            density="compact"
            hide-details
            variant="outlined"
            class=""
            @update:model-value="settings.updateSettings({ editor: { theme: $event ?? 'vs-dark' } })"
          />
        </div>
        
        <div class="setting-item">
          <label>Font Size</label>
          <v-number-input
            :model-value="settings.settings.editor?.fontSize ?? 14"
            density="compact"
            variant="outlined"
            hide-details
            :min="8"
            :max="32"
            @update:model-value="settings.updateSettings({ editor: { fontSize: $event ?? 14 } })"
          />
        </div>

        <div class="setting-item">
          <label>Word Wrap</label>
          <v-select
            :model-value="settings.settings.editor?.wordWrap ?? 'off'"
            :items="wordWrapOptions"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="settings.updateSettings({ editor: { wordWrap: $event ?? 'off' } })"
          />
        </div>

        <div class="setting-item">
          <label>Tab Size</label>
          <v-number-input
            :model-value="settings.settings.editor?.tabSize ?? 2"
            density="compact"
            hide-details
            variant="outlined"
            :min="1"
            :max="8"
            @update:model-value="settings.updateSettings({ editor: { tabSize: $event ?? 2 } })"
          />
        </div>

        <div class="setting-item">
          <label>Line Numbers</label>
          <v-select
            :model-value="settings.settings.editor?.lineNumbers ?? 'on'"
            :items="lineNumberOptions"
            item-title="label"
            item-value="value"
            density="compact"
            hide-details
            variant="outlined"
            @update:model-value="settings.updateSettings({ editor: { lineNumbers: $event ?? 'on' } })"
          />
        </div>

        <div class="setting-item">
          <label>Scroll Beyond Last Line</label>
          <v-switch
            :model-value="settings.settings.editor?.scrollBeyondLastLine ?? true"
            density="compact"
            hide-details
            inset
            color="primary"
            @update:model-value="settings.updateSettings({ editor: { scrollBeyondLastLine: $event ?? true } })"
          />
        </div>

        <div class="setting-item">
          <label>Show Minimap</label>
          <v-switch
            :model-value="settings.settings.editor?.minimap?.enabled ?? true"
            density="compact"
            hide-details
            inset
            color="primary"
            @update:model-value="settings.updateSettings({ editor: { minimap: { enabled: $event ?? true } } })"
          />
        </div>

        <div class="setting-item">
          <label>Advanced Settings</label>
          <v-switch
            :model-value="advancedSettings"
            density="compact"
            hide-details
            inset
            color="primary"
            @update:model-value="advancedSettings = $event ?? false"
          />
          <div v-if="advancedSettings">
            You can now edit the settings on the right.
            You can find
            <a href="https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IEditorOptions.html" target="_blank">
              editor options here.
            </a>
            <br>
            Be careful, not knowing what you are doing can break the editor.
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2>Compiler</h2>
        <div class="setting-item">
          <label>Verbose Output</label>
          <v-switch
            :model-value="settings.settings.compiler?.verboseOutput ?? true"
            density="compact"
            hide-details
            inset
            color="primary"
            @update:model-value="settings.updateSettings({ compiler: { verboseOutput: $event ?? true } })"
          />
        </div>
      </div>

      <div class="settings-section">
        <v-btn
          @click="tabs.addTab({ type: 'project-settings', name: 'Project Settings' })"
          variant="tonal"
          prepend-icon="mdi-folder-cog-outline"
        >
          Project Settings
        </v-btn>
      </div>
    </div>

    <div class="settings-preview">
      <code-editor
        v-if="settings.settingsUri"
        :uri="settings.settingsUri"
        :readonly="!advancedSettings"
        style="height: 100%"
        ref="editor"
      />
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
    width: 50%;
    overflow-y: auto;
  }

  .settings-preview {
    flex: 1;
    height: 100%;
    width: 50%;
  }
}

.settings-section {
  margin-bottom: 30px;
}

.setting-item {
  padding: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  .v-input {
    max-width: 200px;
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
