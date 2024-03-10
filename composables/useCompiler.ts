import type { PathMap, FileStat } from '@duinoapp/files-multitool';
import { settingsPath } from '@/utils/project-settings';
import { hash } from '@/utils/crypto';
import { asyncTimeout } from '@/utils/general';

interface CompileFile {
  content: string
  name: string
}

interface CompileFlags {
  verbose?: boolean
}

interface CompileLib {
  name: string
  version: string
  url: string
}

interface CompileRequest {
  fqbn: string
  files: CompileFile[]
  noHex?: boolean
  flags?: CompileFlags
  libs?: CompileLib[]
}

interface CompileResponseFile {
  data: string
  address: number
}

interface CompileResponse {
  error?: any,
  log?: string
  hex?: string
  files?: CompileResponseFile[]
  flashFreq?: string
  flashMode?: string
}


export const useCompiler = defineStore('compiler', () => {
  const projects = useProjects();
  const programTerm = useProgramTerminal();

  const serverUrl = 'https://compile.duino.app';

  const compiling = ref(false);
  const cache = new Map<string, CompileResponse>();

  const compile = async (): Promise<CompileResponse> => {
    if (compiling.value) throw new Error('Already compiling.');
    if (!projects.storage) throw new Error('No storage adaptor found.');
    const pathMap = await projects.storage.list('/', true) as PathMap;
    const inoFile = Object.keys(pathMap).find((k) => k.endsWith('.ino'));
    if (!inoFile) throw new Error('No .ino file found.');
    const prefix = inoFile.slice(0, -4);

    programTerm.clear();
    programTerm.write('Compiling...\r\n');
    compiling.value = true;

    const paths = Object.entries(pathMap)
      .filter(([path, stat]: [string, FileStat]) => path !== settingsPath && stat.isFile)
      .map(([path]) => path);
    
    const files = [] as CompileFile[];
    await paths.reduce(async (promise, path) => {
      await promise;
      if (!projects.storage) throw new Error('No storage adaptor found.');
      const content = await projects.storage.readFile(path);
      files.push({ content, name: `${prefix}/${path}` });
    }, Promise.resolve());

    const body = JSON.stringify({
      fqbn: projects.settings?.board || 'arduino:avr:uno',
      files,
    } as CompileRequest);
    const key = await hash(body);

    if (cache.has(key)) {
      // fake delay to show loading spinner
      await asyncTimeout(1000);
      const res = cache.get(key) as CompileResponse;
      if (res.log) programTerm.write(res.log);
      compiling.value = false;
      return res;
    }

    try {
      const res = await fetch(`${serverUrl}/v3/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }).then((r) => r.json());
      programTerm.write(res.log);
      const response = {
        error: res.error,
        log: res.log,
        hex: res.hex,
        files: res.files,
        flashFreq: res.flash_freq,
        flashMode: res.flash_mode,
      };
      cache.set(key, response);
      return response;
    } catch (e) {
      const error = e as Error;
      programTerm.write(`Error: ${error.message}`);
      return { error: error };
    } finally {
      compiling.value = false;
    }
  };

  return {
    serverUrl,
    compile,
    compiling,
  };
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCompiler, import.meta.hot))
}
