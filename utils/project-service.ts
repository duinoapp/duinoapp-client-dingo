import FilesMultitool, {
  type FilesMultitoolType,
  type FilesMultitoolOptions,
  type FileStat,
  type FilesMultitoolPrettyTypes,
} from '@duinoapp/files-multitool';
import camelCase from 'lodash/camelCase';
import type { ProjectSettings } from './project-settings';
import {
  settingsPath,
  saveProjectSettings,
  parseProjectSettings,
  getInoFileName,
  getProjectNameFromIno,
  validateSettings,
} from './project-settings';

export interface ProjectRef {
  id: string
  name: string
  type: FilesMultitoolType
  lastOpened?: number
}

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
`.trimStart();

const getInoFiles = async (storage: FilesMultitool) => {
  const files = await storage.list('/', false);
  return Object.entries(files)
    .filter(([f, stat]: [string, FileStat]) => f.endsWith('.ino') && stat.isFile)
    .map(([f]) => f);
}

export class ProjectService {
  public id: string;
  public name: string;
  public type: FilesMultitoolType;
  public lastOpened: number;

  private storage: FilesMultitool;
  private settings: ProjectSettings;

  private constructor(
    ref: ProjectRef,
    storage: FilesMultitool,
    settings: ProjectSettings
  ) {
    this.id = ref.id;
    this.name = ref.name;
    this.type = ref.type;
    this.lastOpened = Date.now();
    this.storage = storage;
    this.settings = settings;
  }

  static async initialize(ref: ProjectRef, isExisting: boolean = false): Promise<ProjectService> {
    const storage = await this.createStorage(ref);
    
    let inoFileName = getInoFileName(ref.name);
    if (isExisting) {
      inoFileName = await this.validateProjectDirectory(storage);
    }

    ref.name = ref.name || getProjectNameFromIno(inoFileName);

    const settings = await parseProjectSettings(storage, ref.name);
    const project = new ProjectService(ref, storage, settings);
    await project.ensureInoFile();
    return project;
  }

  private static async createStorage(ref: ProjectRef): Promise<FilesMultitool> {
    const adaptorOpts = { ...adaptorOptionsMap[ref.type] };
    if (ref.type === 'indexed-db') {
      adaptorOpts.db = `${adaptorOpts.db}-${camelCase(ref.id)}`
    }
    const storage = new FilesMultitool(ref.type, ref.id, adaptorOpts);
    await storage.init();
    return storage;
  }

  private static async validateProjectDirectory(storage: FilesMultitool): Promise<string> {
    const inoFiles = await getInoFiles(storage);

    if (inoFiles.length > 1) {
      throw new Error('Project directory contains multiple .ino files.');
    }

    const settingsExists = await storage.exists(settingsPath);
    if (!settingsExists) {
      throw new Error('No settings file found in project directory.');
    }

    return inoFiles[0] ?? '';
  }

  static getStorageTypes(): FilesMultitoolPrettyTypes[] {
    return FilesMultitool.getTypes();
  }

  async destroy(): Promise<void> {
    await this.storage.destroy();
  }

  async rename(newName: string): Promise<void> {
    const oldName = this.settings.name;
    if (oldName !== newName) {
      await this.updateSettings({ name: newName });
    }
  }

  async updateSettings(newSettings: Partial<ProjectSettings>): Promise<void> {
    const mergedSettings = { ...this.settings, ...newSettings };
    // TODO: check if settings has actual changes before saving
    validateSettings(mergedSettings);
    await saveProjectSettings(this.storage, mergedSettings);
    this.settings = mergedSettings;
    this.name = mergedSettings.name;
    await this.ensureInoFile();
  }

  async ensureInoFile(): Promise<void> {
    const inoFiles = await getInoFiles(this.storage);

    if (inoFiles.length > 1) {
      throw new Error('Project directory contains multiple .ino files.');
    }

    const expectedInoName = this.getInoFileName();
    const existingInoFile = inoFiles[0];

    if (!existingInoFile) {
      // No ino file exists, create one
      await this.storage.writeFile(expectedInoName, blankIno);
    } else if (existingInoFile !== expectedInoName) {
      // Ino file exists but has wrong name, rename it
      await this.storage.rename(existingInoFile, expectedInoName);
    }
  }

  getInoFileName(): string {
    return getInoFileName(this.name);
  }

  getSettings(): ProjectSettings {
    return { ...this.settings };
  }

  getStorage(): FilesMultitool {
    return this.storage;
  }

  touch(): void {
    this.lastOpened = Date.now();
  }

  toRef(): ProjectRef {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      lastOpened: this.lastOpened,
    };
  }
} 