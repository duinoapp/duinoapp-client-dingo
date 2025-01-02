<script setup lang="ts">
import type { ProjectSearchResult } from '@/composables/useEditorModels';

const { searching, searchProject } = useEditorModels();

const searchQuery = ref('');
const lastSearchQuery = ref('');

const searchResults = ref<ProjectSearchResult>({});

watchDebounced(searchQuery, async (query) => {
  if (query === lastSearchQuery.value) return;
  if (query === '') {
    searchResults.value = {};
    lastSearchQuery.value = '';
    return;
  }
  const results = await searchProject(query);
  if (query !== searchQuery.value) return;
  searchResults.value = results;
  lastSearchQuery.value = query;
}, {
  debounce: 200,
});

</script>

<template>
  <div class="search-area">
    <div class="search-area-header">
      <v-text-field
        v-model="searchQuery"
        :loading="searching"
        label="Search"
        variant="outlined"
        density="compact"
        size="small"
        clearable
      />
    </div>
  </div>
</template>