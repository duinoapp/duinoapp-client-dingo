import sortBy from 'lodash/sortBy';
import { parseJsonl } from '@/utils/jsonl';
import { searchRegex } from '@/utils/search';

export interface BoardConfigOption {
  option: string;
  option_label?: string;
  values: {
    value: string;
    value_label?: string;
    selected?: boolean;
  }[]
}

export interface Board {
  fqbn: string;
  name: string;
  version: string;
  properties_id: string;
  package: {
    maintainer: string;
    url: string;
    website_url: string;
    name: string;
    help: {
      online: string;
    },
    email?: string;
  }
  platform: {
    architecture: string;
    category: string;
    url: string;
    archive_filename: string;
    checksum: string;
    size: number;
    name: string;
  }
  official?: boolean;
  properties?: any;
  identification_properties?: {
    properties: {
      vid?: string;
      pid?: string;
      board?: string;
    }
  }[]
  config_options?: BoardConfigOption[]
}

type BoardOptions = Record<string, string>;

const getSortIndex = (value: string, search: string): number => {
  const index = value.toLocaleLowerCase().indexOf(search.trim().toLocaleLowerCase());
  return index === -1 ? Infinity : index;
};

export const useBoards = defineStore('boards', () => {

  const { getServerUrl } = useServers();
  const projects = useProjects();
  const serverUrl = computed(() => getServerUrl());

  const boards = ref<Board[]>([]);
  const loadingBoards = ref(false);
  const boardsByRef = ref<Map<string, Board>>(new Map());
  const boardsByPlatform = ref<Map<string, Board[]>>(new Map());
  const platforms = computed(() => sortBy(Array.from(boardsByPlatform.value.keys()), [(p) => p.toLocaleLowerCase()]));
  const currentFqbn = computed(() => projects.settings?.board || 'arduino:avr:uno');
  const boardData = computed(() => getFqbnData(currentFqbn.value));
  const currentBoard = computed(() => boardsByRef.value.get(boardData.value.ref));

  const getFqbnData = (fqbn: string) => {
    const [vendor, architecture, board, ...optionsParts] = fqbn.split(':');
    const optionsStr = optionsParts.filter(v => v).join(':');
    const refOptions = optionsStr
      ? Object.fromEntries(optionsStr.split(',').map((o) => o.split('='))) as BoardOptions
      : {} as BoardOptions;
    const ref = `${vendor}:${architecture}:${board}`;
    const data = boardsByRef.value.get(ref);
    const options = data?.config_options?.reduce((acc, opt) => {
      const value = refOptions[opt.option] || opt.values.find((v) => v.selected)?.value;
      if (value) acc[opt.option] = value;
      return acc;
    }, {} as BoardOptions) || {};
    return {
      vendor,
      architecture,
      board,
      ref,
      options,
    };
  };
  
  const genFqbn = (ref: string, options: BoardOptions) => {
    if (!options || !Object.keys(options).length) {
      return ref;
    }
    const board = boardsByRef.value.get(ref);
    if (!board) return ref;
    const optionsStr = Object.entries(options)
      .filter(([key, value]) => !board.config_options?.find((opt) => opt.option === key)?.values.find((v) => v.value === value)?.selected)
      .map(([key, value]) => `${key}=${value}`)
      .join(',')
    if (!optionsStr) return ref;
    return `${ref}:${optionsStr}`;
  };

  const loadBoards = async () => {
    loadingBoards.value = true;
    try {
      const res = await fetch(`${serverUrl.value}/v3/info/boards.jsonl`);
      boards.value = await parseJsonl(await res.arrayBuffer());
      boardsByRef.value = new Map();
      for (const board of boards.value) {
        boardsByRef.value.set(board.fqbn, board);
        if (!boardsByPlatform.value.has(board.platform.name)) {
          boardsByPlatform.value.set(board.platform.name, []);
        }
        boardsByPlatform.value.get(board.platform.name)?.push(board);
      }
    } catch (e) {
      console.error(e);
    }
    loadingBoards.value = false;
  };

  watch(serverUrl, (to, from) => {
    if (to && to !== from) {
      loadBoards();
    }
  }, { immediate: true });

  const isBoardSelected = (board: Board) => {
    return boardData.value?.ref === board.fqbn;
  };

  const searchBoards = (query: string, page = 0, limit = 10, platform?: string) => {
    const regex = searchRegex(query);
    let filteredBoards = [] as Board[];
    if (query.trim() || platform) {
      filteredBoards = boards.value.filter((board) => {
        if (platform && board.platform.name !== platform) return false;
        return regex.test(board.name) || regex.test(board.fqbn);
      });
    } else {
      filteredBoards = boards.value;
    }
    const sortedBoards = sortBy(filteredBoards, [
      (board: Board) => isBoardSelected(board) ? 0 : 1,
      ...(query.trim() ? [
        (board: Board) => getSortIndex(board.name, query),
        ...(query.includes(' ') ? [
          (board: Board) => getSortIndex(board.name, query.split(' ')[0]),
        ] : []),
      ] : []),
      (board: Board) => board.platform.name.toLocaleLowerCase(),
      (board: Board) => board.name.toLocaleLowerCase(),
    ]);
    return {
      data: sortedBoards.slice(page * limit, (page + 1) * limit),
      total: sortedBoards.length,
    };
  };

  const getBoard = (fqbn: string): Board | undefined => {
    const data = getFqbnData(fqbn);
    return boardsByRef.value.get(data.ref);
  };

  const getBoards = (refs: string[]): Board[] => {
    return refs.map((ref) => getBoard(ref)).filter((lib) => lib) as Board[];
  };

  const setBoard = (board: Board, options = {}) => {
    return projects.updateSettings({ board: genFqbn(board.fqbn, options) });
  };

  const setBoardOption = (option: string, value: string) => {
    if (!currentBoard.value) return;
    const opts = { ...boardData.value.options, [option]: value };
    return setBoard(currentBoard.value, opts);
  };

  return {
    boards,
    platforms,
    loadingBoards,
    currentBoard,
    currentFqbn,
    boardData,
    isBoardSelected,
    searchBoards,
    getBoard,
    getBoards,
    setBoard,
    setBoardOption,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBoards, import.meta.hot))
}
