<script setup lang="ts">
import { useTheme } from 'vuetify';
import { useSearch } from '@/composables/useSearch';
import { getContentTypeFromFileName, getIconFromContentType, getIconColorFromContentType } from '../code/code-utils.ts';

const props = defineProps<{
  path: string;
}>();

const expanded = ref(true);
const search = useSearch();
const theme = useTheme();

const results = computed(() => search.getResultsForFile(props.path));
const exceedsLimit = computed(() => results.value.length >= search.searchLimit);

const fileName = computed(() => props.path.split('/').pop() ?? props.path);
const directoryName = computed(() => props.path.split('/').slice(0, -1).join('/'));

const darkMode = computed(() => theme.global.current.value.dark);
const contentType = computed(() => getContentTypeFromFileName(fileName.value));
const icon = computed(() => getIconFromContentType(contentType.value));
const iconColor = computed(() => getIconColorFromContentType(contentType.value, darkMode.value));

</script>

<template>
  <div class="search-result-file">
    <div class="file-header" @click="expanded = !expanded" :title="path">
      <v-icon
        :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        size="small"
      />
      <v-icon
        :icon="icon"
        :color="iconColor"
        size="small"
      />
      <div class="file-name">
        <span class="file-display-name">
          {{ fileName }}
        </span>
        <span v-if="directoryName" class="file-path">
          {{ directoryName }}
        </span>
      </div>
      <v-chip class="result-count ml-2" size="x-small" color="info" variant="tonal">
        {{ results.length }}
      </v-chip>
    </div>
    <div v-if="expanded" class="file-results">
      <div v-if="exceedsLimit" class="text-warning text-caption">
        ⚠️ There are more results in this file, narrow your search to get accurate results
      </div>
      <search-result-line
        v-for="(result, index) in results"
        :key="`${result.range.startLineNumber}-${result.range.startColumn}`"
        :path="path"
        :index="index"
      />
    </div>
  </div>
</template>

<style scoped>
.search-result-file {
  margin-bottom: 8px;
}

.file-header {
  display: flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
}

.file-header:hover {
  background-color: rgba(128, 128, 128, 0.1);
  position: relative;
}

.file-name {
  margin-left: 4px;
  flex: 1;
  font-family: monospace;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(128, 128, 128, 0.8);

  .file-display-name {
    color: rgb(var(--v-theme-on-background));
    padding-right: 4px;
  }
}

.result-count {
  font-weight: bold;
}

.file-results {
  margin-left: 24px;
}

</style> 