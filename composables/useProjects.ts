import { useLocalStorage } from '@vueuse/core';
import FilesMultitool, { type FilesMultitoolType, type FilesMultitoolEvents } from '@duinoapp/files-multitool';
import { defineStore } from 'pinia';
import type { ProjectSettings } from '@/utils/project-settings';
import { ProjectService, type ProjectRef } from '@/utils/project-service';
import {
  starterTemplates,
  createBlankProject,
  importFromFile,
  importFromTemplate,
  importFromUrl,
  exportProject,
  genId,
} from '@/utils/project-importer';

type InitDialogType = 'import' | 'create' | 'open' | 'example' | 'library';

type StorageEventType = keyof FilesMultitoolEvents;
type StorageEventHandler<T extends StorageEventType> = FilesMultitoolEvents[T];

export const useProjects = defineStore('projects', () => {
  const local = useLocalStorage('projects', {
    projectRefs: [] as ProjectRef[],
    currentProjectId: null as string | null,
  }, {
    mergeDefaults: true,
  });

  const _currentProject = ref<ProjectService | null>(null);
  const volatileActions = reactive(new Set<string>());
  const dialog = reactive({
    open: false,
    type: '' as InitDialogType,
    ref: '',
    inoFileName: '',
    onCancel: null as (() => void) | null,
  });

  // Update event handlers to use the event map
  const eventHandlers = shallowRef({} as { [K in StorageEventType]: Set<StorageEventHandler<K>> });

  // Computed properties
  const currentProject = computed(() => _currentProject.value);
  const currentProjectId = computed(() => _currentProject.value?.id ?? null);
  const currentRef = computed(() => local.value.projectRefs.find((p) => p.id === local.value.currentProjectId));
  const settings = computed(() => Object.freeze({ ...(_currentProject.value?.getSettings() ?? {}) }));
  const storage = computed(() => _currentProject.value?.getStorage() ?? null);
  const inoFileName = computed(() => _currentProject.value?.getInoFileName() ?? '');
  const projectItems = computed(() => local.value.projectRefs
    .toSorted((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
    .map((p) => ({
      text: p.name,
      value: p.id,
      type: p.type,
      disabled: p.id === currentProjectId.value,
    })));
  const isVolatile = computed(() => volatileActions.size > 0);
  const storageItems = computed(() => ProjectService.getStorageTypes());

  // Volatile actions management
  const addVolatileAction = (action: string) => volatileActions.add(action);
  const removeVolatileAction = (action: string) => volatileActions.delete(action);
  const waitForVolatileActions = async (): Promise<void> => {
    if (!isVolatile.value) return;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isVolatile.value) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  // Project management
  const setCurrentProject = async (project: ProjectService | null): Promise<void> => {
    const oldProject = _currentProject.value;
    
    if (project) {
      project.touch();
      local.value.projectRefs = local.value.projectRefs
        .filter(p => p.id !== project.id)
        .concat(project.toRef());
      local.value.currentProjectId = project.id;
    } else {
      local.value.currentProjectId = null;
    }
    
    _currentProject.value = project;

    if (oldProject && oldProject !== project) {
      await oldProject.destroy();
    }
  };

  const closeProject = async (project: ProjectService): Promise<void> => {
    await waitForVolatileActions();
    await project.destroy();
    if (currentProjectId.value === project.id) {
      await setCurrentProject(null);
    }
  };

  const loadProject = async (projectId: string): Promise<void> => {
    await waitForVolatileActions();
    const projectRef = local.value.projectRefs.find((p) => p.id === projectId);
    if (!projectRef) throw new Error('Project not found');

    const project = await ProjectService.initialize(projectRef, true);
    await setCurrentProject(project);
  };

  const removeProject = async (projectId: string): Promise<void> => {
    if (projectId === currentProjectId.value) {
      await setCurrentProject(null);
    }
    local.value.projectRefs = local.value.projectRefs.filter(p => p.id !== projectId);
  };

  const createProject = async (type: FilesMultitoolType, name: string): Promise<ProjectService> => {
    await waitForVolatileActions();
    const project = await createBlankProject(type, name);
    await setCurrentProject(project);
    return project;
  };

  const openProject = async (type: FilesMultitoolType): Promise<void> => {
    if (type === 'memory' || type === 'indexed-db') {
      throw new Error('Invalid storage type for opening project');
    }

    const projectRef = {
      id: genId(),
      name: '',  // Will be set from the ino file
      type,
    };

    const project = await ProjectService.initialize(projectRef, true);
    await setCurrentProject(project);
  };

  const init = async (noLoad: boolean = false): Promise<void> => {
    if (!local.value.currentProjectId) return;

    if (noLoad) {
      setCurrentProject(null);
      return;
    }

    try {
      await loadProject(local.value.currentProjectId);
    } catch (e) {
      console.error('Failed to load last project:', e);
      setCurrentProject(null);
    }
  };

  const updateSettings = async (newSettings: Partial<ProjectSettings>): Promise<void> => {
    if (!_currentProject.value) throw new Error('No current project');
    const oldName = _currentProject.value.name;
    
    addVolatileAction('updateSettings');
    try {
      await _currentProject.value.updateSettings(newSettings);
      if (newSettings.name && newSettings.name !== oldName) {
        local.value.projectRefs = local.value.projectRefs.map(p =>
          p.id === currentProjectId.value ? _currentProject.value!.toRef() : p
        );
      }
    } finally {
      removeVolatileAction('updateSettings');
    }
  };

  const renameProject = async (newName: string): Promise<void> => {
    if (newName === currentProject.value?.name) return;
    await updateSettings({ name: newName });
  };

  // Import methods
  const importProject = async (type: FilesMultitoolType, file: File, name?: string): Promise<ProjectService> => {
    const project = await importFromFile(type, file, name);
    await setCurrentProject(project);
    return project;
  };

  const projectFromTemplate = async (type: FilesMultitoolType, template: string, name?: string): Promise<ProjectService> => {
    const project = await importFromTemplate(type, template, name);
    await setCurrentProject(project);
    return project;
  };

  const projectFromUrl = async (type: FilesMultitoolType, url: string, name?: string): Promise<ProjectService> => {
    const project = await importFromUrl(type, url, name);
    await setCurrentProject(project);
    return project;
  };

  const importLibraryProject = async (type: FilesMultitoolType, ref: string, inoFileName: string, name?: string): Promise<ProjectService> => {
    const { getLibrary } = useLibraries();
    const library = await getLibrary(ref);
    if (!library?.resources?.url) throw new Error('Library not found.');
    const projectSettings = {
      ...(name ? { name } : {}),
      libraries: [ref],
      board: settings.value?.board,
      compile: settings.value?.compile,
      monitor: settings.value?.monitor,
    };
    const project = await importFromUrl(type, library?.resources?.url, name, inoFileName);
    project.updateSettings(projectSettings);
    await setCurrentProject(project);
    return project;
  };

  const exportCurrentProject = async (): Promise<File> => {
    if (!currentProject.value) throw new Error('No current project');
    return await exportProject(currentProject.value as ProjectService);
  };

  const initDialog = (
    type: InitDialogType,
    { ref, inoFileName, onCancel }: { ref?: string, inoFileName?: string, onCancel?: () => void } = {}
  ): void => {
    dialog.open = true;
    dialog.type = type;
    dialog.ref = ref ?? '';
    dialog.inoFileName = inoFileName ?? '';
    dialog.onCancel = onCancel ?? null;
  };

  // Update handler management methods to use generics
  const on = <T extends StorageEventType>(event: T, handler: StorageEventHandler<T>): void => {
    if (!eventHandlers.value[event]) {
      eventHandlers.value[event] = new Set() as typeof eventHandlers.value[T];
    }
    const handlers = eventHandlers.value[event];
    handlers.add(handler);
    // If there's an active storage, immediately attach the handler
    storage.value?.on?.(event, handler);
  };

  const off = <T extends StorageEventType>(event: T, handler: FilesMultitoolEvents[T]): void => {
    const handlers = eventHandlers.value[event];
    handlers?.delete(handler);
    // If there's an active storage, remove the handler
    storage.value?.off?.(event, handler);
  };

  // Update watcher to handle type safety
  watch(() => storage.value, (newStorage, oldStorage) => {
    if (oldStorage) {
      // Remove all handlers from old storage
      for (const e in eventHandlers.value) {
        const event = e as StorageEventType;
        const handlers = eventHandlers.value[event];
        for (const handler of handlers) {
          oldStorage.off?.(event, handler);
        }
      }
    }
    if (newStorage) {
      // Add all handlers to new storage
      for (const e in eventHandlers.value) {
        const event = e as StorageEventType;
        const handlers = eventHandlers.value[event];
        for (const handler of handlers) {
          newStorage.on?.(event, handler);
        }
      }
    }
  });

  // Update cleanup to handle type safety
  onUnmounted(() => {
    const currentStorage = storage.value;
    if (currentStorage) {
      for (const e in eventHandlers.value) {
        const event = e as StorageEventType;
        const handlers = eventHandlers.value[event];
        for (const handler of handlers) {
          currentStorage.off?.(event, handler);
        }
      }
    }
  });

  return {
    local,
    _currentProject,
    volatileActions,
    dialog,
    currentProject,
    currentProjectId,
    currentRef,
    settings,
    storage,
    inoFileName,
    projectItems,
    isVolatile,
    starterTemplates,
    storageItems,
    addVolatileAction,
    removeVolatileAction,
    waitForVolatileActions,
    closeProject,
    loadProject,
    removeProject,
    createProject,
    exportCurrentProject,
    openProject,
    init,
    updateSettings,
    renameProject,
    projectFromTemplate,
    projectFromUrl,
    importProject,
    importLibraryProject,
    initDialog,
    on,
    off,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjects, import.meta.hot))
}
