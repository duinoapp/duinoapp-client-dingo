import { defineStore } from 'pinia';
import { useEditorModels } from './useEditorModels';
import type { ProjectSearchResult, SearchResult, SearchOptions } from './useEditorModels';

export const useSearch = defineStore('search', () => {
  const editorModels = useEditorModels();
  const projects = useProjects();
  
  const searchQuery = ref('');
  const lastSearchQuery = ref('');
  const searchResults = ref<ProjectSearchResult>({});
  const searchLimit = ref(100);
  const globalSearchLimit = ref(20 * 1000);
  
  const searching = computed(() => editorModels.searching);

  const numFiles = computed(() => Object.keys(searchResults.value).length);
  const numResults = computed(() => Object.values(searchResults.value).reduce((acc, results) => acc + results.length, 0));
  const exceedsLimit = computed(() => numResults.value > globalSearchLimit.value);

  const searchOptions = ref<SearchOptions>({
    wordSeparators: null,
    matchCase: false,
  });

  const triggerSearch = async (force = false) => {
    const query = searchQuery.value ?? '';
    if (query === lastSearchQuery.value && !force) return;
    let hint: string[] = [];
    if (query === '') {
      searchResults.value = {};
      lastSearchQuery.value = '';
      return;
    } else if (
      query.startsWith(lastSearchQuery.value) 
      && !force
      && !searchOptions.value.wordSeparators
      && !exceedsLimit.value
    ) {
      // hint is the list of files that have been searched before,
      // so we can search in the same files again if the query is prefixed with the last search query
      hint = Object.keys(searchResults.value);
    }
    const results = await editorModels.searchProject(
      query,
      { ...searchOptions.value },
      { hint, limit: globalSearchLimit.value },
    );
    if (query !== searchQuery.value) return;
    searchResults.value = results;
    lastSearchQuery.value = query;
  }

  const getResultsForFile = (path: string): SearchResult[] => {
    return searchResults.value[path] || [];
  };

  const getResult = (path: string, index: number): SearchResult | undefined => {
    return searchResults.value[path]?.[index];
  };

  const toggleMatchCase = () => {
    searchOptions.value.matchCase = !searchOptions.value.matchCase;
    triggerSearch(true);
  };

  const toggleWordSeparators = () => {
    searchOptions.value.wordSeparators = searchOptions.value.wordSeparators === null
      ? '~!@#$%^&*()=+[{]}|;:,.<>?/'
      : null;
    triggerSearch(true);
  };

  const isMatchCase = computed(() => searchOptions.value.matchCase);
  const isWholeWord = computed(() => searchOptions.value.wordSeparators !== null);

  watchDebounced(searchQuery, async () => {
    await triggerSearch();
  }, {
    debounce: 150,
  });

  watch(() => projects.currentProjectId, async () => {
    searchResults.value = {};
    lastSearchQuery.value = '';
    searchQuery.value = '';
  });

  return {
    searchQuery,
    searchResults,
    searching,
    isMatchCase,
    isWholeWord,
    globalSearchLimit,
    searchLimit,
    numFiles,
    numResults,
    exceedsLimit,
    searchOptions: computed(() => Object.freeze({
      ...searchOptions.value,
    })),
    toggleMatchCase,
    toggleWordSeparators,
    getResultsForFile,
    getResult,
    triggerSearch,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearch, import.meta.hot));
} 