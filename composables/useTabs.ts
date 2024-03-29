import { set } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { FilesMultitoolChangeEvent } from '@duinoapp/files-multitool';

export type TabType = 'file' | 'welcome' | 'settings' | 'start-project' | 'invaders' | 'boards' | 'libraries';

export interface ProjectTab {
  id: string
  projectId: string | null
  name: string
  type: TabType
  path?: string
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
    const currentProjectId = projects.currentProject?.id;
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

  const selectTab = (tab: ProjectTab): void => {
    const newTabs = tabs.value.map((t) => (t.projectId === tab.projectId ? {
      ...t,
      isCurrent: t.id === tab.id,
    } : t));
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
    const currentProjectId = projects.currentProject?.id;
    if (!tab.projectId && !currentProjectId) throw new Error('No project selected.');
    if (tab.type === 'file' && !tab.path) throw new Error('No path provided.');
    if (tab.type === 'welcome') throw new Error('Cannot add welcome tab.');
    if (tab.type === 'file') {
      const fileStat = await projects.storage?.stat(tab.path ?? '');
      if (!fileStat?.isFile) throw new Error('Path is not an existing file.');
    }
    const existingTab = findTab(tab.type, tab.path);
    if (existingTab) {
      return selectTab(existingTab);
    }
    const newTab: ProjectTab = {
      id: genId(),
      projectId: currentProjectId || null,
      isCurrent: false,
      isTemporary: tab.isTemporary !== false,
      ...tab,
    };
    tabs.value.push(newTab);
    selectTab(newTab);
  };

  const openFileTab = async (path: string): Promise<void> => {
    const existingTab = findTab('file', path);
    if (existingTab) {
      return selectTab(existingTab);
    }
    const currentProjectId = projects.currentProject?.id;
    if (!currentProjectId) throw new Error('No project selected.');
    const exists = await projects.storage?.exists(path);
    if (!exists) throw new Error(`File ${path} does not exist.`);
    addTab({
      type: 'file',
      name: path.split('/').pop() ?? path,
      path,
      projectId: currentProjectId,
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

  const currentProjectId = computed(() => projects.currentProject?.id);
  const currentStorage = ref(projects.storage);
  watch(currentProjectId, () => {
    if (!currentProjectId.value) return;
    if (projectTabs.value.some((t) => t.type === 'file')) return;
    if (currentStorage.value) currentStorage.value.off?.('file-changed', fileChangeHandler);
    currentStorage.value = projects.storage;
    currentStorage.value?.on?.('file-changed', fileChangeHandler);
    setTimeout(async (): Promise<void> => {
      try {
        if (projects.inoFileName) await openFileTab(projects.inoFileName);
      } catch (e) {}
    }, 100);
  }, { immediate: true });

  onBeforeUnmount(() => {
    if (currentStorage.value) currentStorage.value.off?.('file-changed', fileChangeHandler);
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
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTabs, import.meta.hot))
}
