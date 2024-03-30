import sortBy from 'lodash/sortBy';
import { parseJsonl } from '@/utils/jsonl';
import { searchRegex } from '@/utils/search';

export interface Library {
  name: string;
  author: string;
  version: string;
  maintainer: string;
  sentence: string;
  website: string;
  category: string;
  types: string[];
  resources: {
    url: string;
    archive_filename: string;
    checksum: string;
    size: number;
    cache_path: string;
  };
  urls: { version: string; url: string }[];
  paragraph?: string;
  dependencies?: { name: string }[];
  architectures?: string[];
}

interface CompileLib {
  name: string;
  version: string;
  url: string;
}

const getSortIndex = (value: string, search: string): number => {
  const index = value.toLocaleLowerCase().indexOf(search.trim().toLocaleLowerCase());
  return index === -1 ? Infinity : index;
};

export const useLibraries = defineStore('libraries', () => {

  const { getServerUrl } = useServers();
  const projects = useProjects();
  const serverUrl = computed(() => getServerUrl());

  const libraries = ref<Library[]>([]);
  const loadingLibraries = ref(false);
  const libsByName = ref<Map<string, Library>>(new Map());
  const libsByCategory = ref<Map<string, Library[]>>(new Map());
  const categories = computed(() => Array.from(libsByCategory.value.keys()));
  const currentLibRefs = computed(() => projects.settings?.libraries || []);

  const loadLibraries = async () => {
    loadingLibraries.value = true;
    try {
      const res = await fetch(`${serverUrl.value}/v3/info/libraries.jsonl`);
      libraries.value = await parseJsonl(await res.arrayBuffer());
      libsByName.value = new Map();
      libsByCategory.value = new Map();
      for (const lib of libraries.value) {
        libsByName.value.set(lib.name, lib);
        if (!libsByCategory.value.has(lib.category)) {
          libsByCategory.value.set(lib.category, []);
        }
        libsByCategory.value.get(lib.category)?.push(lib);
      }
    } catch (e) {
      console.error(e);
    }
    loadingLibraries.value = false;
  };

  watch(serverUrl, (to, from) => {
    if (to && to !== from) {
      loadLibraries();
    }
  }, { immediate: true });

  const isLibSelected = (lib: Library, version?: string) => {
    return currentLibRefs.value.some((ref) => ref.split('@')[0] === lib.name && (!version || ref.split('@')[1] === version));
  };

  const searchLibs = (query: string, page = 0, limit = 10, category?: string) => {
    const regex = searchRegex(query);
    let filteredLibs = [] as Library[];
    if (category || query.trim()) {
      filteredLibs = libraries.value.filter((lib) => {
        if (category && lib.category !== category) return false;
        return regex.test(lib.name) || regex.test(lib.sentence);
      });
    } else {
      filteredLibs = libraries.value;
    }
    const sortedLibs = sortBy(filteredLibs, [
      (lib) => isLibSelected(lib) ? 0 : 1,
      ...(query.trim() ? [
        (lib: Library) => getSortIndex(lib.name, query),
        ...(query.includes(' ') ? [
          (lib: Library) => getSortIndex(lib.name, query.split(' ')[0]),
        ] : []),
        (lib: Library) => getSortIndex(lib.sentence, query),
        ...(query.includes(' ') ? [
          (lib: Library) => getSortIndex(lib.sentence, query.split(' ')[0]),
        ] : []),
      ] : []),
      (lib) => lib.name.toLocaleLowerCase(),
    ]);
    return {
      data: sortedLibs.slice(page * limit, (page + 1) * limit),
      total: sortedLibs.length,
    };
  };

  const getLibrary = (ref: string): Library | undefined => {
    const [name, version] = ref.split('@');
    const lib = libsByName.value.get(name);
    if (!lib) return;
    if (!version) return lib;
    const url = lib.urls.find((u) => u.version === version)?.url;
    if (!url) return;
    return { ...lib, resources: { ...lib.resources, url }, version: version || 'latest' };
  };

  const getLibraries = (refs: string[]): Library[] => {
    return refs.map((ref) => getLibrary(ref)).filter((lib) => lib) as Library[];
  };

  const toggleLibrary = (lib: Library, version = 'latest') => {
    const ref = `${lib.name}@${version}`;
    const index = currentLibRefs.value.findIndex((r) => r.split('@')[0] === lib.name);
    const refs = [...currentLibRefs.value]
    if (index === -1) {
      refs.push(ref);
    } else {
      refs.splice(index, 1);
    }
    projects.updateSettings({ libraries: refs });
  };

  const getCurrentVersion = (lib: Library) => {
    const currentRef = currentLibRefs.value.find((ref) => ref.split('@')[0] === lib.name);
    return currentRef?.split('@')[1] || 'latest';
  };

  const getLibsForCompiler = (refs: string[], existing = [] as CompileLib[]): CompileLib[] => {
    const libs = getLibraries(refs);
    const newLibs = libs.map((lib) => {
      return {
        name: lib.name,
        version: getCurrentVersion(lib),
        url: lib.resources.url,
      };
    });
    const allLibs = [...existing, ...newLibs];
    const deps = libs
      .flatMap((lib) => (lib.dependencies || []).map((dep) => dep.name))
      .filter((dep) => !allLibs.some((lib) => lib.name === dep));
    return deps.length ? getLibsForCompiler(deps, allLibs) : allLibs;
  };

  return {
    isLoadingLibs: () => loadingLibraries.value,
    loadLibraries,
    searchLibs,
    getLibrary,
    getLibraries,
    getLibsForCompiler,
    getCategories: () => categories.value,
    isLibSelected,
    toggleLibrary,
    getCurrentVersion,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLibraries, import.meta.hot))
}
