import { useLocalStorage } from '@vueuse/core';
import FilesMultitool from '@duinoapp/files-multitool';
import type { FilesMultitoolType, FilesMultitoolOptions } from '@duinoapp/files-multitool';
import { defineStore } from 'pinia';
import {
  settingsPath,
  saveProjectSettings,
  parseProjectSettings,
  getInoFileName,
} from '@/utils/project-settings';
import type { ProjectSettings } from '@/utils/project-settings';
import {
  starterTemplates,
  importProject,
  importProjectFromTemplate,
  importProjectFromUrl
} from '@/utils/import-project';
import type { ExtractedProject } from '@/utils/import-project';
import { camelCase } from 'change-case';

// interface FilesMultitool extends FMT {};
// const { FilesMultitool } = fmt;

interface BasicProjectRef {
  id: string
  name: string
  type: FilesMultitoolType
};
  
interface Project extends BasicProjectRef {
  storage: FilesMultitool
  settings: ProjectSettings
};

const adaptorOptionsMap = {
  'fsa-api': { db: 'duinoapp', startIn: 'documents' },
  'indexeddb': { db: 'duinoapp' },
  'memory': { db: 'duinoapp' },
} as { [key: string]: FilesMultitoolOptions };

const validateProjectDirectory = async (storage: FilesMultitool, isExisting?: boolean): Promise<void> => {
  const hasSettings = await storage.exists(settingsPath);
  if (!hasSettings) {
    if (isExisting) {
      throw new Error('Directory specified does not contain a settings file.');
    }
    const rootFiles = await storage.list('/');
    if (Object.keys(rootFiles).length > 0) {
      await storage.destroy();
      throw new Error('Project directory is not empty and does not contain a valid project.');
    }
  }
};

const initialiseProject = async (project: BasicProjectRef, isExisting?: boolean): Promise<Project> => {
  const adaptorOpts = { ...adaptorOptionsMap[project.type] };
  if (project.type === 'indexeddb' as FilesMultitoolType) {
    adaptorOpts.db = `${adaptorOpts.db}-${camelCase(project.id)}`
  }
  const storage = new FilesMultitool(project.type, project.id, adaptorOpts);
  await storage.init();
  await validateProjectDirectory(storage, isExisting);
  const settings = await parseProjectSettings(storage, project.name);
  return {
    ...project,
    name: settings.name,
    storage,
    settings,
  } as Project;
};

const genId = (): string => Math.random().toString(36).substring(2);

interface ProjectsLocalStore {
  projectRefs: BasicProjectRef[]
  currentProjectId: string | null
}

export const useProjects = defineStore('projects', {
  state: () => ({
    local: useLocalStorage('projects', {
      projectRefs: [] as BasicProjectRef[],
      currentProjectId: null,
    } as ProjectsLocalStore, { mergeDefaults: true }),
    _currentProject: null as Project | null,
    volatileActions: new Set<string>(),
  }),
  getters: {
    currentProject(): Project | null {
      return this._currentProject;
    },
    currentProjectId(): string | null {
      return this._currentProject?.id ?? null;
    },
    settings(): ProjectSettings | null {
      return this.currentProject?.settings ?? null;
    },
    storage(): FilesMultitool | null {
      return this.currentProject?.storage ?? null;
    },
    projectItems(): { text: string, value: string, disabled: boolean }[] {
      return this.local.projectRefs.map((p) => ({
        text: p.name,
        value: p.id,
        disabled: p.id === this.currentProjectId,
      }));
    },
    isVolatile(): boolean {
      return this.volatileActions.size > 0;
    },
    starterTemplates() {
      return starterTemplates;
    },
  },
  actions: {
    addVolatileAction(action: string): void {
      this.volatileActions.add(action);
    },
    removeVolatileAction(action: string): void {
      this.volatileActions.delete(action);
    },
    waitForVolatileActions(): Promise<void> {
      if (!this.isVolatile) return Promise.resolve();
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.isVolatile) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    },
    async closeProject(project: Project): Promise<void> {
      await this.waitForVolatileActions();
      await project.storage.destroy();
      if (this.currentProjectId === project.id) {
        this.local.currentProjectId = null;
        this._currentProject = null;
      }
    },
    async loadProject(projectId: string): Promise<void> {
      await this.waitForVolatileActions();
      const projectRef = this.local.projectRefs.find((p) => p.id === projectId);
      if (!projectRef) {
        throw new Error(`Project with id ${projectId} not found.`);
      }
      const oldCurrentProject = this._currentProject;
      const project = await initialiseProject(projectRef);
      this.local.currentProjectId = projectId;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
    },
    async renameProject(name: string): Promise<void> {
      if (!this._currentProject) {
        throw new Error('No current project.');
      }
      await this.updateSettings({ name });
    },
    async createProject(type: FilesMultitoolType, name: string): Promise<Project> {
      await this.waitForVolatileActions();
      const id = genId();
      const projectRef = { id, name, type };
      const oldCurrentProject = this._currentProject;
      const project = await initialiseProject(projectRef);
      this.local.projectRefs.push(projectRef);
      this.local.currentProjectId = id;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
      return project;
    },
    async openProject(type: FilesMultitoolType): Promise<Project> {
      const id = genId();
      const projectRef = { id, name: '', type };
      const project = await initialiseProject(projectRef, true);
      const oldCurrentProject = this._currentProject;
      this.local.projectRefs.push(projectRef);
      this.local.currentProjectId = id;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
      return project;
    },
    async init(): Promise<void> {
      if (!this.local.currentProjectId) return;
      const projectRef = this.local.projectRefs.find((p) => p.id === this.local.currentProjectId);
      if (!projectRef) {
        this.local.currentProjectId = null;
        return;
      }
      const project = await initialiseProject(projectRef, true);
      this._currentProject = project;
    },
    async updateSettings(settings: Partial<ProjectSettings>): Promise<void> {
      if (!this._currentProject) {
        throw new Error('No current project.');
      }
      const projectRef = this.local.projectRefs.find((p) => p.id === this.currentProjectId);
      if (!projectRef) {
        throw new Error('No project ref found.');
      }
      const oldName = this._currentProject.name;
      const mergedSettings = { ...this._currentProject.settings, ...settings };
      this.addVolatileAction('updateSettings');
      if (oldName !== mergedSettings.name) {
        const inoStat = await this._currentProject.storage.stat(getInoFileName(oldName));
        if (inoStat) {
          await this._currentProject.storage.rename(
            getInoFileName(oldName),
            getInoFileName(mergedSettings.name)
          );
        }
      }
      await saveProjectSettings(this._currentProject.storage, mergedSettings);
      this._currentProject.settings = mergedSettings;
      this._currentProject.name = mergedSettings.name;
      projectRef.name = mergedSettings.name;
      this.removeVolatileAction('updateSettings');
    },
    async openExtractedProject(type: FilesMultitoolType, extracted: ExtractedProject, name?: string): Promise<Project> {
      const id = genId();
      const projectRef = { id, name: extracted.settings.name, type };
      const project = await initialiseProject(projectRef, false);
      const oldCurrentProject = this._currentProject;
      this.local.projectRefs.push(projectRef);
      this.local.currentProjectId = id;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
      await Promise.all(extracted.files.map(async (f): Promise<void> => {
        if (f.path === settingsPath) return;
        await project.storage.writeFile(f.path, await f.file.arrayBuffer());
      }));
      if (name && name !== extracted.settings.name) {
        extracted.settings.name = name;
      }
      await this.updateSettings(extracted.settings);
      return project;
    },
    async projectFromTemplate(type: FilesMultitoolType, template: string, name?: string): Promise<Project> {
      const extracted = await importProjectFromTemplate(template);
      return this.openExtractedProject(type, extracted, name);
    },
    async projectFromUrl(type: FilesMultitoolType, url: string, name?: string): Promise<Project> {
      const extracted = await importProjectFromUrl(url);
      return this.openExtractedProject(type, extracted, name);
    },
    async importProject(type: FilesMultitoolType, file: File, name?: string): Promise<Project> {
      const extracted = await importProject(file);
      return this.openExtractedProject(type, extracted, name);
    },
  },
});
