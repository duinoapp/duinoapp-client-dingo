import { defineStore } from 'pinia';
import { useMonaco } from '@guolao/vue-monaco-editor';
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import deepEqual from 'fast-deep-equal';

export interface EditorSettings {
  theme: string
  fontSize: number
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  scrollBeyondLastLine: boolean
  tabSize: number
  minimap: {
    enabled?: boolean
  }
  lineNumbers: 'on' | 'off' | 'relative'
}

export interface CompilerSettings {
  verboseOutput: boolean
}

export interface Settings {
  editor: EditorSettings
  compiler: CompilerSettings
}

export interface PartialSettings {
  editor?: Partial<EditorSettings>
  compiler?: Partial<CompilerSettings>
}

const defaultSettings: Settings = {
  editor: {
    theme: 'vs-dark',
    fontSize: 14,
    wordWrap: 'off',
    scrollBeyondLastLine: true,
    tabSize: 2,
    minimap: {
      enabled: true,
    },
    lineNumbers: 'on',
  },
  compiler: {
    verboseOutput: false,
  },
};

const editorThemes = [
  { label: 'VS Dark', value: 'vs-dark', isDark: true },
  { label: 'VS Light', value: 'vs', isDark: false },
  { label: 'High Contrast', value: 'hc-black', isDark: true },
];

const defaultSettingsUri = 'file://duinoapp/settings.json';

export const useSettings = defineStore('settings', () => {
  const settings = useLocalStorage('settings', defaultSettings, { mergeDefaults: true });

  const { monacoRef } = useMonaco();
  const editorModels = useEditorModels();

  const settingsModel = shallowRef<editor.ITextModel | null>(null);
  const settingsUri = ref<string | null>(null);

  const isDefaultSettings = computed(() => {
    return deepEqual(settings.value, defaultSettings);
  });

  const isDarkTheme = computed(() => {
    return editorThemes.find((theme) => theme.value === settings.value.editor.theme)?.isDark ?? true;
  });

  watch(() => monacoRef.value, () => {
    if (!monacoRef.value || settingsModel.value) return;

    const uri = monacoRef.value.Uri.parse(defaultSettingsUri);

    settingsModel.value = monacoRef.value.editor
      .createModel(JSON.stringify(settings.value, null, 2), 'json', uri);

    console.log('addModel', settingsModel.value);
    editorModels.addModel(settingsModel.value);

    settingsUri.value = defaultSettingsUri;

    settingsModel.value.onDidChangeContent(() => {
      const content = settingsModel.value?.getValue();
      if (!content) return;
      try {
        const settingsJson = JSON.parse(content);
        updateSettings(settingsJson, true);
      } catch (error) {
        // console.error('Failed to parse settings JSON', error);
      }
    });
  }, { immediate: true });

  const updateSettings = (newSettings: PartialSettings, skipModelUpdate = false) => {
    settings.value = {
      editor: {
        ...defaultSettings.editor,
        ...settings.value.editor,
        ...newSettings.editor,
      },
      compiler: {
        ...defaultSettings.compiler,
        ...settings.value.compiler,
        ...newSettings.compiler,
      },
    };

    if (!skipModelUpdate) {
      settingsModel.value?.setValue(JSON.stringify(settings.value, null, 2));
    }
  };

  const resetSettings = () => updateSettings(defaultSettings);

  return {
    settings,
    editorThemes,
    isDarkTheme,
    isDefaultSettings,
    settingsModel,
    settingsUri,
    updateSettings,
    resetSettings,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot))
} 