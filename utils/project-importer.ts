import { Archive } from 'libarchive.js';
import type { FilesMultitoolType } from '@duinoapp/files-multitool';
import type { ProjectSettings } from './project-settings';
import {
  validateSettings,
  getDefaultProjectSettings,
  getProjectNameFromIno,
  settingsPath,
  getInoFileName,
} from './project-settings';
import { templates } from '@/starter-templates/templates.json';
import { ProjectService } from './project-service';

export interface ExtractedFileItem {
  path: string
  file: File
}

export interface ExtractedProject {
  settings: ProjectSettings
  files: ExtractedFileItem[]
}

interface StarterTemplate {
  id: string
  name: string
  description: string
  src: string
}

export const starterTemplates = templates as Record<string, StarterTemplate>;

const filesObjectToArray = (filesObject: Record<string, File>, path: string = ''): ExtractedFileItem[] => {
  return Object.keys(filesObject).reduce((acc: ExtractedFileItem[], key) => {
    const file = filesObject[key];
    if (file instanceof File) {
      acc.push({ path: `${path}/${key}`, file });
    } else {
      acc.push(...filesObjectToArray(file, `${path}/${key}`));
    }
    return acc;
  }, []);
};

export const genId = (): string => Math.random().toString(36).substring(2);

const extractProject = async (file: File, inoFileName?: string): Promise<ExtractedProject> => {
  const archive = await Archive.open(file);
  const filesArray = await archive.getFilesArray();
  const settingsFile = filesArray.find((f) => /(^|\/)\.duinoapp\/settings\.json$/.test(`${f.path}${f.file.name}`));
  const inoFile = filesArray.find((f) => /\w+\.ino$/.test(f.file.name) && (!inoFileName || f.file.name === inoFileName));
  
  if (!settingsFile && !inoFile) throw new Error('Archive does not contain a valid project.');
  if (!inoFile) throw new Error('Archive does not contain a valid project root file.');

  let extractedFiles = await archive.extractFiles();
  let projectPath;
  
  if (settingsFile) {
    projectPath = settingsFile.path.replace(/\/?\.duinoapp\/$/, '');
  } else {
    projectPath = inoFile.path;
  }

  if (projectPath) {
    projectPath.split('/').forEach((dir: string) => {
      if (!dir) return;
      extractedFiles = extractedFiles[dir];
    });
  }

  let settings: ProjectSettings;
  if (settingsFile) {
    try {
      settings = JSON.parse(await extractedFiles['.duinoapp']['settings.json'].text());
      validateSettings(settings);
    } catch (e) {
      console.error(e);
      throw new Error('Failed to parse settings file.');
    }
  } else {
    settings = getDefaultProjectSettings(getProjectNameFromIno(inoFile.file.name));
  }

  return {
    settings,
    files: filesObjectToArray(extractedFiles),
  };
};

const fromExtracted = async (
  type: FilesMultitoolType, 
  extracted: ExtractedProject, 
  settings?: Partial<ProjectSettings>
): Promise<ProjectService> => {
  const id = genId();
  const projectRef = {
    id,
    name: extracted.settings.name,
    type,
  };

  const project = await ProjectService.initialize(projectRef);

  await Promise.all(extracted.files.map(async (f): Promise<void> => {
    if (f.path === settingsPath) return;
    const path = f.path.endsWith('.ino') ? getInoFileName(projectRef.name) : f.path;
    await project.getStorage().writeFile(path, await f.file.arrayBuffer());
  }));

  if (settings) {
    Object.assign(extracted.settings, settings);
  }
  await project.updateSettings(extracted.settings);

  return project;
};

export const createBlankProject = async (type: FilesMultitoolType, name: string): Promise<ProjectService> => {
  const id = genId();
  const projectRef = { id, name, type };
  return ProjectService.initialize(projectRef);
};

export const importFromFile = async (type: FilesMultitoolType, file: File, name?: string): Promise<ProjectService> => {
  const extracted = await extractProject(file);
  return fromExtracted(type, extracted, { name });
};

export const importFromUrl = async (
  type: FilesMultitoolType, 
  url: string, 
  name?: string, 
  inoFileName?: string
): Promise<ProjectService> => {
  const res = await fetch(url);
  const blob = await res.blob();
  const extracted = await extractProject(blob as File, inoFileName);
  return fromExtracted(type, extracted, { name });
};

export const importFromTemplate = async (type: FilesMultitoolType, templateId: string, name?: string): Promise<ProjectService> => {
  const template = starterTemplates[templateId];
  if (!template) throw new Error('Template not found.');
  return importFromUrl(type, template.src, name);
};

export const getInoFiles = async (file: File): Promise<string[]> => {
  const archive = await Archive.open(file);
  const filesArray = await archive.getFilesArray();
  return filesArray
    .filter((f) => /\w+\.ino$/.test(f.file.name))
    .map((f) => f.file.name);
};

export const getInoFilesFromUrl = async (url: string): Promise<string[]> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return getInoFiles(blob as File);
}; 