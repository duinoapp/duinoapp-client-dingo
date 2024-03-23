import { asyncTimeout } from '@/utils/general';

export interface ServerInfo {
  name: string;
  location: string;
  country: string;
  countryEmoji: string;
  owner: string;
  website: string;
  description: string;
  isDefault: boolean;
  url: string;
  use: () => void;
  remove: () => void;
}

const getFlagEmoji = (country: string) => {
  const codePoints = country.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const useServers = defineStore('server', () => {
  const projects = useProjects();
  const { public: { devCompileServer } } = useRuntimeConfig();
  
  const defaultServers = [
    ...(devCompileServer ? [devCompileServer] : []),
    'https://compile.duino.app',
  ] as string[];
  const serverUrls = useLocalStorage('compile-servers', defaultServers, { mergeDefaults: true });
  serverUrls.value = [...new Set(serverUrls.value)];
  const serverUrl = computed(() => projects.settings?.compile?.serverUrl || serverUrls.value[0]);
  const servers = ref<ServerInfo[]>([]);
  const loadingServers = ref(false);
  const invalidDialog = ref(false);

  const checkCurrentServer = () => {
    const hasInfo = servers.value.some((s) => s.url === serverUrl.value);
    if (!hasInfo) {
      invalidDialog.value = true;
    }
    return hasInfo;
  }

  const setServerUrl = async (rawUrl: string) => {
    const url = rawUrl.replace(/\/$/, '');
    if (!/^https?:\/\//.test(url)) throw new Error('Invalid server URL.');
    if (!serverUrls.value.includes(url)) {
      serverUrls.value.unshift(url);
    }
    if (projects.settings?.compile?.serverUrl !== url) {
      const compileSettings = projects.settings?.compile || {};
      compileSettings.serverUrl = url;
      await projects.updateSettings({ compile: compileSettings });
    }
    await asyncTimeout(100);
    await loadServers();
  }

  const removeServer = async (url: string) => {
    if (servers.value.some((s) => s.url === url)) {
      servers.value.splice(servers.value.findIndex((s) => s.url === url), 1);
    }
    if (serverUrls.value.includes(url)) {
      serverUrls.value.splice(serverUrls.value.findIndex((u) => u === url), 1);
    }
    if (projects.settings?.compile?.serverUrl === url) {
      const compileSettings = projects.settings?.compile || {};
      compileSettings.serverUrl = serverUrls.value[0];
      await projects.updateSettings({ compile: compileSettings });
    }
  }

  const getServerInfo = async (rawUrl: string): Promise<ServerInfo> => {
    const url = rawUrl.replace(/\/$/, '');
    if (!/^https?:\/\//.test(url)) throw new Error('Invalid server URL.');
    const response = await fetch(`${url}/v3/info/server`);
    if (!response.ok) throw new Error('Failed to get server info.');
    const info = await response.json();
    return {
      ...info,
      countryEmoji: getFlagEmoji(info.country),
      isDefault: defaultServers.includes(url),
      url,
      use: () => setServerUrl(url),
      remove: () => removeServer(url),
    };
  }
  
  const loadServer = async (url: string) => {
    if (servers.value.some((s) => s.url === url)) return;
    console.log('Loading server:', url);
    try {
      const info = await getServerInfo(url);
      servers.value.push(info);
    } catch (e) {
      console.error(e);
    }
  }

  const loadServers = async () => {
    if (loadingServers.value) return;
    loadingServers.value = true;
    await Promise.all(serverUrls.value.map((url) => loadServer(url)));
    loadingServers.value = false;
  }

  const currentProjectId = computed(() => projects.currentProjectId);
  watch(currentProjectId, () => {
    if (!currentProjectId.value) return;
    const url = projects.settings?.compile?.serverUrl || serverUrls.value[0];
    setServerUrl(url);
  }, { immediate: true });

  return {
    servers,
    isLoadingServers: () => loadingServers.value,
    showInvalidDialog: () => invalidDialog.value,
    hideInvalidDialog: () => invalidDialog.value = false,
    getServerUrl: () => serverUrl.value,
    setServerUrl,
    getServerInfo,
    checkCurrentServer,
    loadServers,
  };
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServers, import.meta.hot))
}
