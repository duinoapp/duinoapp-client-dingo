import equal from 'fast-deep-equal';
import FilesMultitool from '@duinoapp/files-multitool';
import { pascalCase } from 'change-case';

export interface ProjectSettings {
  settingsVersion?: '1.0.0'
  name: string
  description?: string
  author?: string
  version: string
  editor: 'text' | 'blockly'
  libraries: string[]
  board: string
}

export const settingsPath = '.duinoapp/settings.json';

export const validateSettings = (settings: ProjectSettings): void => {
  if (settings.settingsVersion !== '1.0.0') throw new Error('Invalid settings version.');
  if (!settings.name) throw new Error('Project name is required.');
  if (!settings.version) throw new Error('Project version is required.');
  if (!settings.editor) throw new Error('Project editor is required.');
  if (!settings.board) throw new Error('Project board is required.');
}

export const getInoFileName = (name: string): string => {
  return `${pascalCase(name)}.ino`;
}

export const getDefaultProjectSettings = (name: string = 'New Project') => ({
  settingsVersion: '1.0.0',
  name,
  author: '',
  version: '1.0.0',
  editor: 'text',
  libraries: [],
  board: 'arduino:avr:uno',
} as ProjectSettings);

export const saveProjectSettings = async (storage: FilesMultitool, settings: ProjectSettings): Promise<void> => {
  await storage.writeFile(settingsPath, JSON.stringify(settings, null, 2));
};

export const parseProjectSettings = async (storage: FilesMultitool, name: string): Promise<ProjectSettings> => {
  const defaultProjectSettings = getDefaultProjectSettings(name);
  let parsedSettings: ProjectSettings;
  try {
    const settingsRaw = await storage.readFile(settingsPath);
    parsedSettings = JSON.parse(settingsRaw);
  } catch (e) {
    parsedSettings = defaultProjectSettings;
  }
  const settings = { ...defaultProjectSettings, ...parsedSettings } as ProjectSettings;
  if (!equal(parsedSettings, settings)) {
    await saveProjectSettings(storage, settings);
  }
  return settings;
};