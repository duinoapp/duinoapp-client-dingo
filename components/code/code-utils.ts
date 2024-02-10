interface FileDef {
  exts: string[]
  icon: string
  iconColor: string
  iconColorDark?: string
  language: string
  contentTypes: string[]
}

const fileDefs: FileDef[] = [
  {
    exts: ['js'],
    icon: 'mdi-language-javascript',
    iconColor: '#f7df1e',
    language: 'javascript',
    contentTypes: ['text/javascript'],
  },
  {
    exts: ['ts'],
    icon: 'mdi-language-typescript',
    iconColor: '#007acc',
    language: 'typescript',
    contentTypes: ['application/typescript'],
  },
  {
    exts: ['json'],
    icon: 'mdi-code-json',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'json',
    contentTypes: ['application/json'],
  },
  {
    exts: ['html'],
    icon: 'mdi-code-tags',
    iconColor: '#e5532c',
    iconColorDark: '#ef6a30',
    language: 'html',
    contentTypes: ['text/html'],
  },
  {
    exts: ['css'],
    icon: 'mdi-language-css3',
    iconColor: '#356bb4',
    iconColorDark: '#4a9fd9',
    language: 'css',
    contentTypes: ['text/css'],
  },
  {
    exts: ['md'],
    icon: 'mdi-language-markdown',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'markdown',
    contentTypes: ['text/markdown'],
  },
  {
    exts: ['cpp', 'c', 'h'],
    icon: 'mdi-language-cpp',
    iconColor: '#f34b7d',
    language: 'cpp',
    contentTypes: ['text/x-c++src', 'text/x-c'],
  },
  {
    exts: ['ino'],
    icon: 'mdi-infinity',
    iconColor: '#48acb2',
    language: 'cpp',
    contentTypes: ['text/x-arduino'],
  },
  {
    exts: ['c'],
    icon: 'mdi-language-c',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'c',
    contentTypes: ['text/x-csrc', 'text/x-c'],
  },
  {
    exts: ['h'],
    icon: 'mdi-language-c',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'c',
    contentTypes: ['text/x-c++hdr', 'text/x-chdr'],
  },
  {
    exts: ['txt'],
    icon: 'mdi-file-document-outline',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'plaintext',
    contentTypes: ['text/plain'],
  },
];

const defaultFileDef = [...fileDefs].pop() as FileDef;

export const getContentTypeFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';
  const fileDef = fileDefs.find((fd) => fd.exts.includes(extension)) || defaultFileDef;
  return fileDef.contentTypes[0];
};

export const getLanguageFromContentType = (contentType: string): string => {
  const fileDef = fileDefs.find((fd) => fd.contentTypes.includes(contentType)) || defaultFileDef;
  return fileDef.language;
};

export const getIconFromContentType = (contentType: string): string => {
  const fileDef = fileDefs.find((fd) => fd.contentTypes.includes(contentType)) || defaultFileDef;
  return fileDef.icon;
};


export const getIconColorFromContentType = (contentType: string, darkMode: boolean): string => {
  const fileDef = fileDefs.find((fd) => fd.contentTypes.includes(contentType)) || defaultFileDef;
  return darkMode && fileDef.iconColorDark ? fileDef.iconColorDark : fileDef.iconColor;
}
