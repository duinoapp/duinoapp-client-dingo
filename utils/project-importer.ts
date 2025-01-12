import { strFromU8, zip, unzip, type AsyncZipOptions, type AsyncZippable } from 'fflate';
import type { FilesMultitoolType, FileStat } from '@duinoapp/files-multitool';
import { pascalCase } from 'change-case';
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

const zipAsync = async (data: AsyncZippable, options: AsyncZipOptions = {}): Promise<Uint8Array> => new Promise((resolve, reject) => {
  zip(data, options, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

const unzipAsync = async (data: Uint8Array): Promise<Record<string, Uint8Array>> => new Promise((resolve, reject) => {
  unzip(data, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

const extractProject = async (file: File | Blob, inoFileName?: string): Promise<ExtractedProject> => {
  const buffer = await file.arrayBuffer();
  const files = await unzipAsync(new Uint8Array(buffer));

  // Find settings and ino files
  const entries = Object.entries(files);
  const settingsFile = entries.find(([path]) => /(^|\/)\.duinoapp\/settings\.json$/.test(path));
  const inoFile = entries.find(([path]) => /\w+\.ino$/.test(path) && (!inoFileName || path.endsWith(inoFileName)));

  if (!settingsFile && !inoFile) throw new Error('Archive does not contain a valid project.');
  if (!inoFile) throw new Error('Archive does not contain a valid project root file.');

  let projectPath;
  if (settingsFile) {
    projectPath = settingsFile[0].replace(/\/?\.duinoapp\/.+/, '');
  } else {
    projectPath = inoFile[0].replace(/\/?[^/]+\.ino$/, '');
  }

  let settings: ProjectSettings;
  if (settingsFile) {
    try {
      settings = JSON.parse(strFromU8(settingsFile[1]));
      validateSettings(settings);
    } catch (e) {
      console.error(e);
      throw new Error('Failed to parse settings file.');
    }
  } else {
    const inoName = inoFile[0].split('/').pop() || '';
    settings = getDefaultProjectSettings(getProjectNameFromIno(inoName));
  }

  // Convert files to ExtractedFileItem format
  const extractedFiles: ExtractedFileItem[] = entries.reduce((acc: ExtractedFileItem[], [fullPath, content]) => {
    if (projectPath && !fullPath.startsWith(projectPath)) return acc;
    const path = projectPath ? fullPath.replace(projectPath, '') : fullPath;
    const fileName = path.split('/').pop() || '';
    acc.push({
      path: path.replace(/^\/+/, ''),
      file: new File([content], fileName)
    });
    return acc;
  }, []);

  return {
    settings,
    files: extractedFiles,
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
  const buffer = await file.arrayBuffer();
  const files = await unzipAsync(new Uint8Array(buffer));

  return Object.keys(files)
    .filter(path => /\w+\.ino$/.test(path))
};

export const getInoFilesFromUrl = async (url: string): Promise<string[]> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return getInoFiles(blob as File);
};

export const exportProject = async (project: ProjectService): Promise<File> => {
  const pathMap = await project.getStorage().list('/', true);
  const paths = Object.entries(pathMap)
    .filter(([path, stat]: [string, FileStat]) => stat.isFile)
    .map(([path]) => path);

  // Create zip object with files
  const zipObj: Record<string, Uint8Array> = {};
  
  await Promise.all(paths.map(async (path) => {
    const raw = await project.getStorage().readFile(path, 'base64');
    const blob = await fetch(`data:application/octet-stream;base64,${raw}`).then(r => r.blob());
    zipObj[path] = new Uint8Array(await blob.arrayBuffer());
  }));

  // Use synchronous zip since we already have all the data in memory
  const zipped = await zipAsync(zipObj, {
    level: 6, // Default compression level
    mem: 8, // Default memory level
  });

  return new File(
    [zipped], 
    `${pascalCase(project.name)}.zip`, 
    { type: 'application/zip' }
  );
};
