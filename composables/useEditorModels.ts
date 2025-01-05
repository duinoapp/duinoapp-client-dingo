import { defineStore } from 'pinia';
import type { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api';
import { useMonaco } from '@guolao/vue-monaco-editor';
import { watchDebounced } from '@vueuse/core';
import { getContentTypeFromFileName, getLanguageFromContentType, getFileDefFromFileName } from '@/components/code/code-utils';
import type { FilesMultitoolChangeEvent, FileStat } from '@duinoapp/files-multitool';

const defaultSearchOptions = {
  isRegex: false,
  matchCase: false,
  wordSeparators: null as string | null,
  captureMatches: false,
  limitResultCount: 100,
  captureLines: true,
};

const defaultProjectSearchOptions = {
  limit: 20 * 1000,
  hint: [] as string[],
};

export type SearchOptions = Partial<typeof defaultSearchOptions>;
export type SearchResult = {
  path: string;
  range: editor.FindMatch['range'];
  matches: editor.FindMatch['matches'];
  lines: string[];
  // allLines: string[];
};
export type ProjectSearchOptions = Partial<typeof defaultProjectSearchOptions>;
export type ProjectSearchResult = Record<string, SearchResult[]>;

export const useEditorModels = defineStore('editorModels', () => {
  const projects = useProjects();
  const { monacoRef } = useMonaco();

  // Cache models by their URIs
  const models = shallowRef(new Map<string, editor.ITextModel>());
  const modelStates = shallowRef(new Map<string, editor.ICodeEditorViewState>());
  const rawBuffers = shallowRef(new Map<string, Uint8Array>());
  const loading = ref(false);
  const searching = ref(false);
  const error = ref<Error | null>(null);
  const handlingEvents = ref(false);
  const entireProjectLoaded = ref(false);

  // Buffer for pending saves
  const pendingSaves = ref(new Set<string>());

  // Helper to get URI for a project file
  const getUri = (projectId: string, path: string): Uri => {
    return monacoRef.value!.Uri.from({
      scheme: 'file',
      authority: projectId,
      path: `/${path.replace(/^\//, '')}`,
    });
  };

  // Helper to get URI string
  const getUriString = (projectId: string, path: string): string => {
    return getUri(projectId, path).toString();
  };

  // Helper to get info from a URI
  const parseUri = (uri: string): { projectId: string, path: string } => {
    const uriObj = monacoRef.value!.Uri.parse(uri);
    return { projectId: uriObj.authority, path: uriObj.path.slice(1) };
  };

  const isTextFile = (path: string) => {
    const fileDef = getFileDefFromFileName(path);
    const editorType = fileDef.editor;
    return editorType === 'code' || editorType === 'rich-text';
  };

  // Watch pending saves and handle file writes
  watchDebounced(() => Array.from(pendingSaves.value.values()), async () => {
    const savePaths = Array.from(pendingSaves.value.values());
    if (!savePaths.length) return;
    
    pendingSaves.value.clear();

    projects.addVolatileAction('editor:saveFile');
    try {
      await Promise.all(savePaths.map(async (uriStr) => {
        const model = models.value.get(uriStr);
        if (!model) return;

        const { projectId, path } = parseUri(uriStr);
        if (projectId !== projects.currentProjectId) return;
        if (!isTextFile(path)) return;

        await projects.storage?.writeFile(path, model.getValue());
      }));
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to save files');
      console.error('Failed to save files:', e);
    } finally {
      projects.removeVolatileAction('editor:saveFile');
    }
  }, { debounce: 500 });


  const loadContent = async (projectId: string, path: string): Promise<string> => {
    const uriStr = getUriString(projectId, path);
    const raw = await projects.storage?.readFile(path, 'base64') ?? '';
    const buffer = await fetch(`data:application/octet-stream;base64,${raw}`).then(r => r.arrayBuffer());
    rawBuffers.value.set(uriStr, new Uint8Array(buffer));
    if (!isTextFile(path)) return '';
    return new TextDecoder().decode(buffer);
  };
  
  const loadModelContent = async (projectId: string, path: string) => {
    const uriStr = getUriString(projectId, path);
    const model = models.value.get(uriStr);
    if (!model) return;
    const content = await loadContent(projectId, path);
    if (content !== model.getValue()) {
      model.setValue(content);
    }
  };

  // Get or create model for a file
  const getModel = async (projectId: string, path: string, forceContent: boolean = false): Promise<editor.ITextModel | null> => {
    if (!monacoRef.value) return null;
    error.value = null;
    
    const uriStr = getUriString(projectId, path);
    if (models.value.has(uriStr)) {
      const model = models.value.get(uriStr)!;
      if (model.isDisposed()) {
        models.value.delete(uriStr);
      } else {
        if (forceContent && isTextFile(path)) {
          await loadModelContent(projectId, path);
        }
        return model;
      }
    }

    loading.value = true;
    try {
      const content = await loadContent(projectId, path);
      const language = getLanguageFromContentType(getContentTypeFromFileName(path));
      
      const model = monacoRef.value.editor.createModel(content, language, getUri(projectId, path));
      models.value.set(uriStr, model);

      // Setup change listener
      model.onDidChangeContent(() => {
        pendingSaves.value.add(uriStr);
      });

      return model;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to load file');
      console.error('Failed to load file:', e);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const addModel = (model: editor.ITextModel) => {
    models.value.set(model.uri.toString(), model);
  };

  // Save view state for a model
  const saveViewState = (uri: string, state: editor.ICodeEditorViewState | null) => {
    if (state) {
      modelStates.value.set(uri, state);
    } else {
      modelStates.value.delete(uri);
    }
  };

  // Get saved view state for a model
  const getViewState = (uri: string): editor.ICodeEditorViewState | null => {
    return modelStates.value.get(uri) ?? null;
  };

  const getModelByUri = (uri: string): editor.ITextModel | null => {
    return models.value.get(uri) ?? null;
  };

  const getModelRawBuffer = (uri: string): Uint8Array | null => {
    return rawBuffers.value.get(uri) ?? null;
  };

  // Dispose model
  const disposeModel = (projectId: string, path: string) => {
    const uriStr = getUriString(projectId, path);
    const model = models.value. get(uriStr);
    if (model) {
      model.dispose();
      models.value.delete(uriStr);
      modelStates.value.delete(uriStr);
      pendingSaves.value.delete(uriStr);
      rawBuffers.value.delete(uriStr);
    }
  };

  const asyncTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const waitUntilReady = async (preTimeout: boolean = false) => {
    if (preTimeout) {
      await asyncTimeout(100);
    }
    for (let i = 0; i < 100; i++) {
      if (!handlingEvents.value) return;
      await asyncTimeout(10);
    }
  };

  // Handle file system events
  const fileChangeHandler = async (path: string, change: FilesMultitoolChangeEvent) => {
    await waitUntilReady();
    handlingEvents.value = true;
    const projectId = projects.currentProjectId!;
    if (change.action === 'deleted') {
      disposeModel(projectId, change.path);
    } else if (change.action === 'renamed') {
      const oldUriStr = getUriString(projectId, change.oldPath!);
      const model = models.value.get(oldUriStr);
      const viewState = modelStates.value.get(oldUriStr);

      if (model) {
        // Create new model with new path
        const newModel = await getModel(projectId, change.path);
        
        if (newModel) {
          // Restore view state if we had one
          if (viewState) {
            modelStates.value.set(newModel.uri.toString(), viewState);
          }
          
          // Transfer any pending saves to new model
          if (pendingSaves.value.has(oldUriStr)) {
            pendingSaves.value.delete(oldUriStr);
            pendingSaves.value.add(newModel.uri.toString());
          }
        }

        // Cleanup old model
        model.dispose();
        models.value.delete(oldUriStr);
        modelStates.value.delete(oldUriStr);
        rawBuffers.value.delete(oldUriStr);
      }
    }
    handlingEvents.value = false;
  };

  const loadEntireProject = async () => {
    if (!projects.currentProjectId || entireProjectLoaded.value) return;
    const projectId = projects.currentProjectId;
    const files = await projects.storage?.list('/', true);
    if (!files) return;
    await Promise.all(Object.entries(files).map(async ([path, file]: [string, FileStat]) => {
      if (file.isDirectory) return;
      await getModel(projectId, path);
    }));
    entireProjectLoaded.value = true;
  };

  const searchModel = (projectId: string, path: string, query: string, options: SearchOptions = defaultSearchOptions): SearchResult[] => {
    const opts = {
      ...defaultSearchOptions,
      ...options,
    };
    const uriStr = getUriString(projectId, path);
    const model = models.value.get(uriStr);
    if (!model) return [];
    const results = model.findMatches(
      query,
      true, // searchOnlyEditableRange
      opts.isRegex,
      opts.matchCase,
      opts.wordSeparators,
      opts.captureMatches,
      opts.limitResultCount,
    );
    if (!results?.length) return [];
    const allLines = opts.captureLines ? model.getLinesContent() : [];
    return results.map((result) => {
      const lines = allLines.slice(result.range.startLineNumber - 1, result.range.endLineNumber);
      return {
        path,
        range: result.range,
        matches: result.matches,
        lines,
        // allLines,
      };
    });
  };

  const searchProject = async (
    query: string,
    options: SearchOptions = defaultSearchOptions,
    projectSearchOptions: ProjectSearchOptions = defaultProjectSearchOptions,
  ) => {
    const opts = { ...defaultProjectSearchOptions, ...projectSearchOptions };
    const projectId = projects.currentProjectId;
    if (!projectId) return {};
    searching.value = true;
    await loadEntireProject();
    const response: ProjectSearchResult = {};
    let count = 0;
    let fileCount = 0;
    for (const uri of Array.from(models.value.keys()).sort()) {
      const { projectId: modelProjectId, path } = parseUri(uri);
      if (path.startsWith('.duinoapp')) continue;
      if (opts.hint.length && !opts.hint.includes(path)) continue;
      if (modelProjectId !== projectId) continue;

      const results = searchModel(projectId, path, query, options);
      if (results?.length) {
        response[path] = results;
        count += results.length;
        if (count >= opts.limit) break;
      }
      fileCount += 1;
      // every 20 files, timeout for 10ms to avoid blocking the main thread
      if (fileCount % 20 === 0) {
        await asyncTimeout(10);
      }
    }
    searching.value = false;
    return response;
  };

  // Cleanup on project change
  watch(() => projects.currentProjectId, (newId, oldId) => {
    if (oldId) {
      // Dispose all models from old project
      for (const [uri, model] of models.value.entries()) {
        if (uri.includes(oldId)) {
          model.dispose();
          models.value.delete(uri);
          modelStates.value.delete(uri);
          pendingSaves.value.delete(uri);
        }
      }
    }

    // initialise existing models in the editor
    if (newId && monacoRef.value) {
      const allModels = monacoRef.value?.editor?.getModels() ?? [];
      for (const model of allModels) {
        if (model.isDisposed()) continue;
        const uri = model.uri.toString();
        if (uri.startsWith(`file://${newId}/`)) {
          models.value.set(uri, model);
        }
      }
    }
  }, { immediate: true });

  // Setup file change handler
  onMounted(() => {
    projects.on('file-changed', fileChangeHandler);
  });

  onBeforeUnmount(() => {
    projects.off('file-changed', fileChangeHandler);
  });

  return {
    loading,
    searching,
    error,
    getUri,
    getUriString,
    parseUri,
    addModel,
    getModel,
    getModelByUri,
    getModelRawBuffer,
    disposeModel,
    saveViewState,
    getViewState,
    waitUntilReady,
    loadEntireProject,
    searchModel,
    searchProject,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEditorModels, import.meta.hot));
} 