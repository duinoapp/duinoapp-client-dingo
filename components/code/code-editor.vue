<script lang="ts" setup>
import { useMonaco } from '@guolao/vue-monaco-editor';
import { type editor } from 'monaco-editor/esm/vs/editor/editor.api';
import type { EditorOptions } from './code';
import { useEditorModels } from '@/composables/useEditorModels';

const props = withDefaults(defineProps<{
  uri?: string | null,
  theme?: string,
  options?: EditorOptions,
  highlightColor?: string,
  lineNumber?: number | null,
  readonly?: boolean,
}>(), {
  uri: null,
  theme: '',
  options: () => ({
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
  }),
  highlightColor: 'rgba(93, 167, 151, 0.4)',
  lineNumber: null,
  readonly: false,
});

const { monacoRef, unload } = useMonaco();
const editorModels = useEditorModels();
const search = useSearch();
const settings = useSettings();

const editorRef = shallowRef<editor.IStandaloneCodeEditor>();
const searchCollection = shallowRef<editor.IEditorDecorationsCollection>();

const setSearchDecorators = (uri: string) => {
  if (!searchCollection.value || !monacoRef.value) return;
  if (!search.searchQuery) {
    searchCollection.value.clear();
    return;
  }
  const { authority, path } = monacoRef.value.Uri.parse(uri);
  if (authority === 'duinoapp') return;
  const results = editorModels.searchModel(
    authority,
    path,
    search.searchQuery,
    { ...search.searchOptions, limitResultCount: 10 * 1000, captureLines: false },
  );
  const decorations: editor.IModelDeltaDecoration[] = results.map((result) => {
    return {
      range: result.range,
      options: {
        description: 'find-match',
        stickiness: monacoRef.value?.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges,
        zIndex: 10,
        className: 'highlight',
        inlineClassName: 'highlight',
        showIfCollapsed: true,
        overviewRuler: {
          position: monacoRef.value?.editor.OverviewRulerLane.Center || 2,
          color: props.highlightColor,
        },
        minimap: {
          color: props.highlightColor,
          darkColor: props.highlightColor,
          position: monacoRef.value?.editor.MinimapPosition.Inline || 1,
        },
      },
    };
  });
  searchCollection.value?.set(decorations);
};

const setLineNumber = () => {
  setTimeout(() => {
    if (!editorRef.value || !props.lineNumber) return;
    editorRef.value.revealLineInCenter(props.lineNumber);
    editorRef.value.setPosition({
      lineNumber: props.lineNumber,
      column: 1,
    });
  }, 100);
};

// Helper functions to manage editor state
const saveEditorState = (uri: string) => {
  if (!editorRef.value) return;
  const state = editorRef.value.saveViewState();
  editorModels.saveViewState(uri, state);
};

const setEditorModel = (uri: string) => {
  if (!editorRef.value) return;
  const model = editorModels.getModelByUri(uri);
  if (!model) return;

  editorRef.value.setModel(model);
  const state = editorModels.getViewState(uri);
  if (state) {
    editorRef.value.restoreViewState(state);
  }
  setSearchDecorators(uri);
  setLineNumber();
};

// Event handlers
const handleMount = (codeEditor: editor.IStandaloneCodeEditor) => {
  if (editorRef.value) return;
  editorRef.value = codeEditor;
  searchCollection.value = codeEditor.createDecorationsCollection();
  if (props.uri) {
    setEditorModel(props.uri);
  }
  codeEditor.onDidChangeModelContent(() => {
    if (search.searchQuery && props.uri) {
      setSearchDecorators(props.uri);
    }
  });
};

// Computed
const ready = computed(() => !!monacoRef.value);

const editorSettings = computed(() => {
  return {
    ...settings.settings.editor,
    readOnly: props.readonly,
    ...props.options,
    theme: props.theme || settings.settings.editor.theme || 'vs-dark',
  };
});

// Watchers
watch(() => props.uri, (newUri, oldUri) => {
  if (!editorRef.value) return;

  if (oldUri) {
    saveEditorState(oldUri);
  }
  if (newUri) {
    setEditorModel(newUri);
  }
});

watch(() => search.searchResults, () => {
  if (!props.uri) return;
  setSearchDecorators(props.uri);
});

watch(() => props.lineNumber, () => {
  setLineNumber();
});

// Lifecycle
onBeforeUnmount(() => {
  if (props.uri) {
    saveEditorState(props.uri);
  }
  editorRef.value?.setModel(null);
  if (!monacoRef.value) unload();
});

defineExpose({
  editorRef,
});
</script>

<template>
  <vue-monaco-editor
    v-if="ready"
    :theme="editorSettings.theme"
    :options="editorSettings"
    @mount="handleMount"
  />
</template>
