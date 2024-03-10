import { Archive } from 'libarchive.js';
import type { ProjectSettings } from './project-settings';
import {
  validateSettings,
  getDefaultProjectSettings,
  getProjectNameFromIno,
} from './project-settings';
import { templates } from '@/starter-templates/templates.json';


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
}

/**
 * Unzips an archive and returns the extracted files at the detected project root
 * project root is the directory containing '.duinoapp/settings.json'
 * @param file The zip file to import
 * @returns The extracted project { settings: ProjectSettings, filesObject: Record<string, File>}
 */
export const importProject = async (file: File): Promise<ExtractedProject> => {
  const archive = await Archive.open(file);
  const filesArray = await archive.getFilesArray();
  const settingsFile = filesArray.find((f) => /(^|\/)\.duinoapp\/settings\.json$/.test(`${f.path}${f.file.name}`));
  const inoFile = filesArray.find((f) => /\w+\.ino$/.test(f.file.name));
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
      extractedFiles = extractedFiles[dir];
    });
  }
  let settings = null;
  if (settingsFile) {
    try {
      settings = JSON.parse(await extractedFiles['.duinoapp']['settings.json'].text());
    } catch (e) {
      console.error(e);
      throw new Error('Failed to parse settings file.');
    }
    // settings.name = getProjectNameFromIno(inoFile.file.name);
    validateSettings(settings);
  } else {
    settings = getDefaultProjectSettings(getProjectNameFromIno(inoFile.file.name));
  }
  return {
    settings,
    files: filesObjectToArray(extractedFiles),
  };
}

/**
 * Imports a project zip from a URL
 * @param url The URL of the zip file to import
 * @returns The extracted project { settings: ProjectSettings, filesObject: Record<string, File>}
*/
export const importProjectFromUrl = async (url: string): Promise<ExtractedProject> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return importProject(blob as File);
}

/**
 * Imports a project zip from a template id
 * @param templateId The id of the template to import
 * @returns The extracted project { settings: ProjectSettings, filesObject: Record<string, File>}
*/
export const importProjectFromTemplate = async (templateId: string): Promise<ExtractedProject> => {
  const template = starterTemplates[templateId];
  if (!template) throw new Error('Template not found.');
  return importProjectFromUrl(template.src);
}

