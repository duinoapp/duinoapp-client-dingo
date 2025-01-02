import { defineStore } from 'pinia';
import type { FilesMultitoolChangeEvent } from '@duinoapp/files-multitool';
import type { IRange } from 'monaco-editor/esm/vs/editor/editor.api';

export type TabType = 'file' | 'welcome' | 'settings' | 'start-project' | 'invaders' | 'boards' | 'libraries' | 'project-settings';

export interface ProjectTab {
  id: string
  projectId: string | null
  name: string
  type: TabType
  path?: string
  range?: IRange
  isCurrent: boolean
  isTemporary?: boolean
}

export interface NewProjectTab extends Omit<Partial<ProjectTab>, 'id' | 'isCurrent' | 'projectId'> {
  type: TabType
  name: string
  projectId?: string
}

const genId = () => {
  return Math.random().toString(36).substring(2);
};

export const useTabs = defineStore('tabs', () => {
  const projects = useProjects();

  const tabs = useLocalStorage('tabs', [] as ProjectTab[], { mergeDefaults: true });

  const projectTabs = computed((): ProjectTab[] => {
    const currentProjectId = projects.currentProjectId;
    if (!currentProjectId) return [{
      id: 'welcome',
      projectId: null,
      name: 'Welcome',
      type: 'welcome',
      isCurrent: true,
    }] as ProjectTab[];
    const pTabs = tabs.value.filter((t) => t.projectId === currentProjectId);
    if (!pTabs.length) {
      return [{
        id: 'start-project',
        projectId: currentProjectId,
        name: 'Start Project',
        type: 'start-project',
        isCurrent: true,
      }] as ProjectTab[];
    } else if (!pTabs.some((t) => t.isCurrent)) {
      pTabs[0].isCurrent = true;
    }
    return pTabs;
  });

  const currentTab = computed(() => {
    return projectTabs.value.find((t) => t.isCurrent) ?? null;
  });

  const selectTab = (tab: ProjectTab, newTabData: Partial<ProjectTab> = {}): void => {
    const newTabs = tabs.value.map((t) => (t.projectId === tab.projectId ? reactive({
      ...t,
      ...newTabData,
      isCurrent: t.id === tab.id,
    }) : t));
    tabs.value = newTabs;
  };

  const findTab = (type: TabType, path?: string): ProjectTab | null => {
    if (type === 'file' && !path) throw new Error('No path provided.');
    return projectTabs.value.find((t) => t.type === type && (type !== 'file' || t.path === path)) ?? null;
  };

  const toggleTemporary = (tab: ProjectTab, flag?: boolean): void => {
    const newTabs = tabs.value.map((t) => (t.id === tab.id ? {
      ...t,
      isTemporary: flag ?? !t.isTemporary,
    } : t));
    tabs.value = newTabs;
  };

  const addTab = async (tab: NewProjectTab): Promise<void> => {
    const currentProjectId = projects.currentProjectId;
    if (!tab.projectId && !currentProjectId) throw new Error('No project selected.');
    if (tab.type === 'file' && !tab.path) throw new Error('No path provided.');
    if (tab.type === 'welcome') throw new Error('Cannot add welcome tab.');
    if (tab.type === 'file') {
      const fileStat = await projects.storage?.stat(tab.path ?? '');
      if (!fileStat?.isFile) throw new Error('Path is not an existing file.');
    }
    const existingTab = findTab(tab.type, tab.path);
    if (existingTab) {
      return selectTab(existingTab, { range: tab.range });
    }
    const newTab: ProjectTab = {
      id: genId(),
      projectId: currentProjectId || null,
      isCurrent: false,
      isTemporary: tab.isTemporary !== false,
      ...tab,
    };
    tabs.value.push(reactive(newTab));
    selectTab(newTab, { range: tab.range });
  };

  const openFileTab = async (path: string, range?: IRange): Promise<void> => {
    const existingTab = findTab('file', path);
    if (existingTab) {
      return selectTab(existingTab, { range });
    }
    const currentProjectId = projects.currentProjectId;
    if (!currentProjectId) throw new Error('No project selected.');
    const exists = await projects.storage?.exists(path);
    if (!exists) throw new Error(`File ${path} does not exist.`);
    addTab({
      type: 'file',
      name: path.split('/').pop() ?? path,
      path,
      projectId: currentProjectId,
      range,
    });
  };

  const closeTab = (tab: ProjectTab): void => {
    if (tab.isCurrent) {
      let tabIndex = tabs.value.findIndex((t) => t.id === tab.id);
      const newCurrentTab = (tabIndex > 0 && tabs.value[tabIndex - 1]) || tabs.value[tabIndex + 1];
      if (newCurrentTab) newCurrentTab.isCurrent = true;
    }
    const newTabs = tabs.value.filter((t) => t.id !== tab.id);
    tabs.value = newTabs;
  };

  const clearRange = (tab: ProjectTab): void => {
    if (tab.range) {
      tab.range = undefined;
    }
  };

  const fileChangeHandler = (_: string, change: FilesMultitoolChangeEvent): void => {
    if (change.action === 'deleted') {
      const tab = findTab('file', change.path);
      if (tab) closeTab(tab);
    } else if (change.action === 'renamed') {
      const tab = findTab('file', change.oldPath);
      if (tab) {
        tab.name = change.path.split('/').pop() || change.path;
        tab.path = change.path;
      }
    }
  };

  watch(() => projects.currentProjectId, (value) => {
    if (!value) return;
    setTimeout(async (): Promise<void> => {
      try {
        if (projects.inoFileName) await openFileTab(projects.inoFileName);
      } catch (e) {}
    }, 100);
  }, { immediate: true });

  onMounted(() => {
    projects.on('file-changed', fileChangeHandler);
  });

  onBeforeUnmount(() => {
    projects.off('file-changed', fileChangeHandler);
  });

  return {
    tabs,
    projectTabs,
    currentTab,
    selectTab,
    findTab,
    toggleTemporary,
    addTab,
    openFileTab,
    closeTab,
    clearRange,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTabs, import.meta.hot))
}
