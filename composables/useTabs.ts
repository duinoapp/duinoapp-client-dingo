import { defineStore } from 'pinia';

export interface ProjectTab {
  id: string
  projectId: string | null
  name: string
  type: 'file' | 'welcome' | 'settings'
  path?: string
  isCurrent: boolean
  isTemporary?: boolean
}

export interface NewProjectTab extends Omit<ProjectTab, 'id' | 'isCurrent' | 'projectId'> {
  projectId?: string
}

const genId = () => {
  return Math.random().toString(36).substring(2);
}

export const useTabs = () => {
  const projects = useProjects();
  return defineStore('tabs', {
    state: () => ({
      tabs: useLocalStorage('tabs', [] as ProjectTab[], { mergeDefaults: true }),
    }),
    getters: {
      projectTabs(): ProjectTab[] {
        const currentProjectId = projects.currentProject?.id;
        if (!currentProjectId) return [{
          id: genId(),
          projectId: null,
          name: 'Welcome',
          type: 'welcome',
          isCurrent: true,
        }];
        return this.tabs.filter((t) => t.projectId === currentProjectId);
      },
      currentTab(): ProjectTab | null {
        return this.projectTabs.find((t) => t.isCurrent) ?? null;
      }
    },
    actions: {
      selectTab(tab: ProjectTab): void {
        const tabs = this.tabs.map((t) => (t.projectId === tab.projectId ? {
          ...t,
          isCurrent: t.id === tab.id,
        } : t));
        this.tabs = tabs;
      },
      findTab(type: string, path?: string): ProjectTab | null {
        if (type === 'file' && !path) throw new Error('No path provided.');
        return this.projectTabs.find((t) => t.type === type && (type !== 'file' || t.path === path)) ?? null;
      },
      toggleTemporary(tab: ProjectTab, flag?: boolean): void {
        const tabs = this.tabs.map((t) => (t.id === tab.id ? {
          ...t,
          isTemporary: flag ?? !t.isTemporary,
        } : t));
        this.tabs = tabs;
      },
      async addTab(tab: NewProjectTab): Promise<void> {
        const currentProjectId = projects.currentProject?.id;
        if (!tab.projectId && !currentProjectId) throw new Error('No project selected.');
        if (tab.type === 'file' && !tab.path) throw new Error('No path provided.');
        if (tab.type === 'welcome') throw new Error('Cannot add welcome tab.');
        const fileStat = await projects.storage?.stat(tab.path ?? '');
        if (!fileStat?.isFile) throw new Error('Path is not an existing file.');
        const existingTab = this.findTab(tab.type, tab.path);
        if (existingTab) {
          return this.selectTab(existingTab);
        }
        const newTab: ProjectTab = {
          id: genId(),
          projectId: currentProjectId || null,
          isCurrent: false,
          isTemporary: tab.isTemporary !== false,
          ...tab,
        };
        this.tabs.push(newTab);
        this.selectTab(newTab);
      },
      async openFileTab(path: string): Promise<void> {
        const existingTab = this.findTab('file', path);
        if (existingTab) {
          return this.selectTab(existingTab);
        }
        const currentProjectId = projects.currentProject?.id;
        if (!currentProjectId) throw new Error('No project selected.');
        const exists = await projects.storage?.exists(path);
        if (!exists) throw new Error(`File ${path} does not exist.`);
        this.addTab({
          type: 'file',
          name: path.split('/').pop() ?? path,
          path,
          projectId: currentProjectId,
        });
      },
      closeTab(tab: ProjectTab): void {
        const tabs = this.tabs.filter((t) => t.id !== tab.id);
        this.tabs = tabs;
      },
    },
  })();
};
