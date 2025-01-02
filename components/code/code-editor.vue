<script lang="ts" setup>
import { useMonaco } from '@guolao/vue-monaco-editor';
import { type editor, Uri } from 'monaco-editor';
import type { EditorOptions } from './code';
import { useEditorModels } from '@/composables/useEditorModels';

const props = withDefaults(defineProps<{
  uri?: string | null,
  theme?: string,
  options?: EditorOptions,
  highlightColor?: string,
}>(), {
  uri: null,
  theme: 'vs-dark',
  options: () => ({
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
  }),
  highlightColor: 'rgba(93, 167, 151, 0.4)',
});

const { monacoRef, unload } = useMonaco();
const editorModels = useEditorModels();
const search = useSearch();

const editorRef = shallowRef<editor.IStandaloneCodeEditor>();
const searchCollection = shallowRef<editor.IEditorDecorationsCollection>();

const setSearchDecorators = (uri: string) => {
  if (!searchCollection.value) return;
  if (!search.searchQuery) {
    searchCollection.value.clear();
    return;
  }
  const { authority, path } = Uri.parse(uri);
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
    :theme="theme"
    :options="options"
    @mount="handleMount"
  />
</template>
