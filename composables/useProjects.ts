import { useLocalStorage } from '@vueuse/core';
import FilesMultitool from '@duinoapp/files-multitool';
import type { FilesMultitoolType, FilesMultitoolOptions, FileStat } from '@duinoapp/files-multitool';
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
  lastOpened?: number
};
  
interface Project extends BasicProjectRef {
  storage: FilesMultitool
  settings: ProjectSettings
  lastOpened: number
};

type InitDialogType = 'import' | 'create' | 'open' | 'example' | 'library';

const adaptorOptionsMap = {
  'fsa-api': { db: 'duinoapp', startIn: 'documents' },
  'indexed-db': { db: 'duinoapp' },
  'memory': { db: 'duinoapp' },
} as { [key: string]: FilesMultitoolOptions };

const blankIno = `
void setup() {
  // put your setup code here, to run once:

}

void loop() {
  // put your main code here, to run repeatedly:

}
`;

const validateProjectDirectory = async (storage: FilesMultitool, isExisting?: boolean): Promise<string> => {
  // const hasSettings = await storage.exists(settingsPath);
  // const hasIno = await storage.exists(getInoFileName(projectName));
  const rootFiles = await storage.list('/', false);
  const inoFiles = Object.entries(rootFiles).filter(([f, stat]: [string, FileStat]) => f.endsWith('.ino') && stat.isFile);
  if (inoFiles.length > 1) {
    await storage.destroy();
    throw new Error('Project directory contains multiple .ino files.');
  }
  const hasIno = inoFiles.length > 0;
  if (!hasIno) {
    if (isExisting) {
      await storage.destroy();
      throw new Error('Directory specified does not contain a ino file.');
    }
    const rootFiles = await storage.list('/');
    if (Object.keys(rootFiles).length > 0) {
      await storage.destroy();
      throw new Error('Project directory is not empty and does not contain a valid project.');
    }
  }
  return inoFiles[0]?.[0] ?? '';
};

const initialiseProject = async (project: BasicProjectRef, isExisting?: boolean): Promise<Project> => {
  const adaptorOpts = { ...adaptorOptionsMap[project.type] };
  if (project.type === 'indexed-db') {
    adaptorOpts.db = `${adaptorOpts.db}-${camelCase(project.id)}`
  }
  const storage = new FilesMultitool(project.type, project.id, adaptorOpts);
  await storage.init();
  const inoFileName = await validateProjectDirectory(storage, isExisting);
  const settings = await parseProjectSettings(storage, getProjectNameFromIno(inoFileName) || project.name);
  project.name = settings.name;
  if (!inoFileName) {
    await storage.writeFile(getInoFileName(project.name), blankIno);
  } else if (inoFileName.replace(/(^\/)/g, '') !== getInoFileName(project.name)) {
    await storage.rename(inoFileName, getInoFileName(project.name));
  }
  return {
    ...project,
    name: settings.name,
    storage,
    settings,
    lastOpened: Date.now(),
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
    dialog: {
      open: false,
      type: '' as InitDialogType,
      ref: '',
      inoFileName: '',
      onCancel: null as (() => void) | null,
    },
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
    inoFileName(): string | null {
      return getInoFileName(this.currentProject?.name ?? '');
    },
    projectItems(): { text: string, value: string, disabled: boolean, type: FilesMultitoolType }[] {
      return this.local.projectRefs
        .toSorted((a, b) => b.lastOpened! - a.lastOpened!)
        .map((p) => ({
          text: p.name,
          value: p.id,
          type: p.type,
          disabled: p.id === this.currentProjectId,
        }));
    },
    isVolatile(): boolean {
      return this.volatileActions.size > 0;
    },
    starterTemplates() {
      return starterTemplates;
    },
    storageItems() {
      return FilesMultitool.getTypes();
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
      const project = await initialiseProject(projectRef, true);
      projectRef.lastOpened = project.lastOpened;
      this.local.currentProjectId = projectId;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
    },
    removeProject(projectId: string): void {
      this.local.projectRefs = this.local.projectRefs.filter((p) => p.id !== projectId);
      if (this.local.currentProjectId === projectId) {
        this.local.currentProjectId = null;
        this._currentProject = null;
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
      const projectRef = { id, name, type } as BasicProjectRef;
      const oldCurrentProject = this._currentProject;
      const project = await initialiseProject(projectRef);
      projectRef.lastOpened = project.lastOpened;
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
      const projectRef = { id, name: '', type } as BasicProjectRef;
      const project = await initialiseProject(projectRef, true);
      projectRef.lastOpened = project.lastOpened;
      const oldCurrentProject = this._currentProject;
      this.local.projectRefs.push(projectRef);
      this.local.currentProjectId = id;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
      return project;
    },
    async init(noLoad?: boolean): Promise<void> {
      if (!this.local.currentProjectId) return;
      const projectRef = this.local.projectRefs.find((p) => p.id === this.local.currentProjectId);
      this.local.currentProjectId = null;
      if (!projectRef || noLoad) {
        return;
      }
      setTimeout(() => {
        this.loadProject(projectRef.id);
      }, 100);
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
    async openExtractedProject(type: FilesMultitoolType, extracted: ExtractedProject, settings?: Partial<ProjectSettings>): Promise<Project> {
      const id = genId();
      const projectRef = { id, name: extracted.settings.name, type } as BasicProjectRef;
      const project = await initialiseProject(projectRef, false);
      projectRef.lastOpened = project.lastOpened;
      const oldCurrentProject = this._currentProject;
      this.local.projectRefs.push(projectRef);
      this.local.currentProjectId = id;
      this._currentProject = project;
      if (oldCurrentProject) {
        await this.closeProject(oldCurrentProject);
      }
      await Promise.all(extracted.files.map(async (f): Promise<void> => {
        if (f.path === settingsPath) return;
        const path = f.path.endsWith('.ino') ? getInoFileName(projectRef.name) : f.path;
        await project.storage.writeFile(path, await f.file.arrayBuffer());
      }));
      Object.assign(extracted.settings, settings || {});
      await this.updateSettings(extracted.settings);
      return project;
    },
    async projectFromTemplate(type: FilesMultitoolType, template: string, name?: string): Promise<Project> {
      const extracted = await importProjectFromTemplate(template);
      return this.openExtractedProject(type, extracted, { name });
    },
    async projectFromUrl(type: FilesMultitoolType, url: string, name?: string): Promise<Project> {
      const extracted = await importProjectFromUrl(url);
      return this.openExtractedProject(type, extracted, { name });
    },
    async importProject(type: FilesMultitoolType, file: File, name?: string): Promise<Project> {
      const extracted = await importProject(file);
      return this.openExtractedProject(type, extracted, { name });
    },
    async importLibraryProject(type: FilesMultitoolType, ref: string, inoFileName: string, name?: string): Promise<Project> {
      const { getLibrary } = useLibraries();
      const library = await getLibrary(ref);
      const settings = {
        name,
        libraries: [ref],
        board: this.settings?.board,
        compile: this.settings?.compile,
        monitor: this.settings?.monitor,
      };
      if (!library?.resources?.url) throw new Error('Library not found.');
      const extracted = await importProjectFromUrl(library?.resources?.url, inoFileName);
      return this.openExtractedProject(type, extracted, settings);
    },
    initDialog(
      type: InitDialogType,
      { ref, inoFileName, onCancel }: { ref?: string, inoFileName?: string, onCancel?: () => void } = {}
    ): void {
      this.dialog.open = true;
      this.dialog.type = type;
      this.dialog.ref = ref ?? '';
      this.dialog.inoFileName = inoFileName ?? '';
      this.dialog.onCancel = onCancel ?? null;
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjects, import.meta.hot))
}
