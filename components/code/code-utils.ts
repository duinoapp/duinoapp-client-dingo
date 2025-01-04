interface FileDef {
  exts: string[];
  editor: 'code' | 'image' | 'video' | 'audio' | 'rich-text';
  icon: string;
  iconColor: string;
  iconColorDark?: string;
  language: string;
  contentTypes: Record<string, string[]>;
  isSelectable: boolean;
  title: string;
  description: string;
}

export const fileDefs: FileDef[] = [
  {
    exts: ['js'],
    editor: 'code',
    icon: 'mdi-language-javascript',
    iconColor: '#f7df1e',
    language: 'javascript',
    contentTypes: { js: ['text/javascript'] },
    isSelectable: false,
    title: 'JavaScript',
    description: 'JavaScript is a high-level, interpreted programming language that is used to create interactive and dynamic web pages.',
  },
  {
    exts: ['ts'],
    editor: 'code',
    icon: 'mdi-language-typescript',
    iconColor: '#007acc',
    language: 'typescript',
    contentTypes: { ts: ['application/typescript'] },
    isSelectable: false,
    title: 'TypeScript',
    description: 'TypeScript is a superset of JavaScript that adds static typing and other features to the language.',
  },
  {
    exts: ['json'],
    editor: 'code',
    icon: 'mdi-code-json',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'json',
    contentTypes: { json: ['application/json'] },
    isSelectable: false,
    title: 'JSON',
    description: 'JSON (JavaScript Object Notation) is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate.',
  },
  {
    exts: ['html'],
    editor: 'code',
    icon: 'mdi-code-tags',
    iconColor: '#e5532c',
    iconColorDark: '#ef6a30',
    language: 'html',
    contentTypes: { html: ['text/html'] },
    isSelectable: false,
    title: 'HTML',
    description: 'HTML (HyperText Markup Language) is the standard markup language used to create web pages.',
  },
  {
    exts: ['css'],
    editor: 'code',
    icon: 'mdi-language-css3',
    iconColor: '#356bb4',
    iconColorDark: '#4a9fd9',
    language: 'css',
    contentTypes: { css: ['text/css'] },
    isSelectable: false,
    title: 'CSS',
    description: 'CSS (Cascading Style Sheets) is a style sheet language used to describe the presentation of a document written in HTML.',
  },
  {
    exts: ['ino'],
    editor: 'code',
    icon: 'mdi-infinity',
    iconColor: '#48acb2',
    language: 'cpp',
    contentTypes: { ino: ['text/x-arduino'] },
    isSelectable: false,
    title: 'Arduino Sketch',
    description: 'INO files are used as the base for Arduino sketches.',
  },
  {
    exts: ['cpp'],
    editor: 'code',
    icon: 'mdi-language-cpp',
    iconColor: '#f34b7d',
    language: 'cpp',
    contentTypes: { cpp: ['text/x-c++src', 'text/x-c'] },
    isSelectable: true,
    title: 'C++ Code',
    description: 'C++ code files are used to implement logic.',
  },
  {
    exts: ['c'],
    editor: 'code',
    icon: 'mdi-language-c',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'c',
    contentTypes: { c: ['text/x-csrc', 'text/x-c'] },
    isSelectable: true,
    title: 'C Code',
    description: 'C code files are used to implement logic.',
  },
  {
    exts: ['h'],
    editor: 'code',
    icon: 'mdi-language-c',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'c',
    contentTypes: { h: ['text/x-c++hdr', 'text/x-chdr'] },
    isSelectable: true,
    title: 'C/C++ Header',
    description: 'C/C++ header files are used to declare functions and variables.',
  },
  {
    exts: ['md'],
    editor: 'code',
    icon: 'mdi-language-markdown',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'markdown',
    contentTypes: { md: ['text/markdown'] },
    isSelectable: true,
    title: 'Markdown',
    description: 'Markdown is a lightweight markup language with plain text formatting syntax.',
  },
  {
    exts: ['txt'],
    editor: 'code',
    icon: 'mdi-file-document-outline',
    iconColor: '#555555',
    iconColorDark: '#ffffff',
    language: 'plaintext',
    contentTypes: { txt: ['text/plain'] },
    isSelectable: true,
    title: 'Plain Text',
    description: 'Plain text files are used to store plain text.',
  },
  {
    exts: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'ico', 'webp'],
    editor: 'image',
    icon: 'mdi-image',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'binary',
    title: 'Image',
    description: 'Image files are used to store images.',
    contentTypes: {
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      gif: ['image/gif'],
      bmp: ['image/bmp'],
      tiff: ['image/tiff'],
      ico: ['image/ico'],
      webp: ['image/webp']
    },
    isSelectable: false,
  },
  {
    exts: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    editor: 'video',
    icon: 'mdi-video',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'binary',
    title: 'Video',
    description: 'Video files are used to store video.',
    contentTypes: {
      mp4: ['video/mp4'],
      avi: ['video/avi'],
      mov: ['video/mov'],
      wmv: ['video/wmv'],
      flv: ['video/flv'],
      webm: ['video/webm']
    },
    isSelectable: false,
  },
  {
    exts: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'aiff', 'au'],
    editor: 'audio',
    icon: 'mdi-music',
    iconColor: '#000000',
    iconColorDark: '#ffffff',
    language: 'binary',
    title: 'Audio',
    description: 'Audio files are used to store audio.',
    contentTypes: {
      mp3: ['audio/mp3'],
      wav: ['audio/wav'],
      ogg: ['audio/ogg'],
      flac: ['audio/flac'],
      aac: ['audio/aac'],
      m4a: ['audio/m4a'],
      wma: ['audio/wma'],
      aiff: ['audio/aiff'],
      au: ['audio/au']
    },
    isSelectable: false,
  },
];

const defaultFileDef = [...fileDefs].pop() as FileDef;

export const getContentTypeFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop() || '';
  const fileDef = fileDefs.find((fd) => fd.exts.includes(extension)) || defaultFileDef;
  return fileDef.contentTypes[extension]?.[0] || fileDef.contentTypes[fileDef.exts[0]][0];
};

export const getLanguageFromContentType = (contentType: string): string => {
  const fileDef = fileDefs.find((fd) => 
    Object.values(fd.contentTypes).some(types => types.includes(contentType))
  ) || defaultFileDef;
  return fileDef.language;
};

export const getIconFromContentType = (contentType: string): string => {
  const fileDef = fileDefs.find((fd) => Object.values(fd.contentTypes).some(types => types.includes(contentType))) || defaultFileDef;
  return fileDef.icon;
};


export const getIconColorFromContentType = (contentType: string, darkMode: boolean): string => {
  const fileDef = fileDefs.find((fd) => Object.values(fd.contentTypes).some(types => types.includes(contentType))) || defaultFileDef;
  return darkMode && fileDef.iconColorDark ? fileDef.iconColorDark : fileDef.iconColor;
}

export const getFileDefFromContentType = (contentType: string): FileDef => {
  return fileDefs.find((fd) => Object.values(fd.contentTypes).some(types => types.includes(contentType))) || defaultFileDef;
}

export const getFileDefFromFileName = (fileName: string): FileDef => {
  const extension = fileName.split('.').pop() || '';
  return fileDefs.find((fd) => fd.exts.includes(extension)) || defaultFileDef;
}