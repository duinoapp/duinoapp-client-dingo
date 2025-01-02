<script setup lang="ts">
import { useSearch } from '@/composables/useSearch';

const search = useSearch();

const localisedNumber = (value: number) => new Intl.NumberFormat().format(value);

</script>

<template>
  <div class="search-area">
    <div class="search-area-header">
      <div class="d-flex align-center mb-1">
        <div class="text-h6">Search</div>
        <v-spacer />
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click="search.triggerSearch(true)"
        >
          <v-icon>mdi-refresh</v-icon>
          <v-tooltip activator="parent" location="bottom">
            Refresh Search Results
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          :color="search.isMatchCase ? 'primary' : 'default'"
          variant="text"
          @click="search.toggleMatchCase"
        >
          <v-icon>mdi-format-letter-case</v-icon>
          <v-tooltip activator="parent" location="bottom">
            Match Case (a vs A)
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          :color="search.isWholeWord ? 'primary' : 'default'"
          variant="text"
          @click="search.toggleWordSeparators"
        >
          <v-icon>mdi-format-letter-matches</v-icon>
          <v-tooltip activator="parent" location="bottom">
            Match Whole Words Only
            <br>
            ("app" wont match "apple")
          </v-tooltip>
        </v-btn>
      </div>
      <v-text-field
        v-model.trim="search.searchQuery"
        :loading="search.searching"
        variant="outlined"
        density="compact"
        size="small"
        clearable
        hide-details
      />
    </div>
    <div class="search-info">
      <div v-if="search.numResults > 0" class="result-count">
        {{ localisedNumber(search.numResults) }} results found in {{ localisedNumber(search.numFiles) }} files
      </div>
      <div v-else-if="search.searchQuery">
        🤷 No results found, try a different search.
      </div>
      <div v-else>
        Search for code across all files in your project.
        <br>
        <br>
        Just start typing above!
      </div>
      <v-alert
        v-if="search.exceedsLimit"
        :icon="false"
        type="warning"
        density="compact"
        text="⚠️ These results don't include all matches, narrow your search to get accurate results"
        variant="tonal"
      />
    </div>
    <div v-if="search.numResults > 0" class="search-results">
      <search-result-file
        v-for="(results, path) in search.searchResults"
        :key="path"
        :path="path"
      />
    </div>
  </div>
</template>

<style scoped>
.search-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-area-header {
  padding: 8px;
}

.search-results {
  flex: 1;
  overflow-y: scroll;
  padding: 8px;
}

.search-info {
  padding: 8px;
  color: rgba(128, 128, 128, 1);
}
</style>
