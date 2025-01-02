<script setup lang="ts">
import { useEditorModels } from '@/composables/useEditorModels';
import { useSearch } from '@/composables/useSearch';

const props = defineProps<{
  path: string;
  index: number;
}>();

const search = useSearch();
const tabs = useTabs();

const container = ref<HTMLDivElement | null>(null);

const result = computed(() => search.getResult(props.path, props.index));

// compute trimming and highlighting parts
const startColumn = computed(() => (result.value?.range.startColumn ?? 0) - 1);
const endColumn = computed(() => (result.value?.range.endColumn ?? 0) - 1);

const firstLine = computed(() => result.value?.lines[0] ?? '');
const lastLine = computed(() => result.value?.lines[result.value?.lines.length - 1] ?? '');
const prefix = computed(() => firstLine.value.slice(0, startColumn.value).trimStart());
const suffix = computed(() => lastLine.value.slice(endColumn.value).trimEnd());
const highlight = computed(() => {
  const start = startColumn.value;
  const end = endColumn.value;
  const lines = result.value?.lines ?? [];
  if (lines.length === 1) {
    return lines[0].slice(start, end);
  } else if (lines.length === 2) {
    return lines[0].slice(start, end) + '\n' + lines[1].slice(0, end);
  }
  const otherLines = lines.slice(1, -1).join('\n');
  return lines[0].slice(start) + '\n' + otherLines + '\n' + lines[2].slice(0, end);
});

// ellipsis the prefix if it's too long
const maxToStart = computed(() => Math.max(5, Math.round((container.value?.clientWidth ?? 0) / 10) - highlight.value.length - 3));
const truncatedPrefix = computed(() => prefix.value.length >= maxToStart.value
  ? `…${prefix.value.slice(maxToStart.value * -1)}`
  : prefix.value);

const fullPreview = computed(() => {
  const lines = result.value?.lines ?? [];
  const initialTrim = lines[0].length - lines[0].trimStart().length;
  return lines.map((line) => line.slice(initialTrim)).join('\n');
});

// handle click to open the file and navigate to the result
const handleClick = async () => {
  if (!result.value) return;

  tabs.openFileTab(props.path, result.value.range);
};
</script>

<template>
  <div
    v-if="result"
    class="search-result-line"
    ref="container"
    :title="fullPreview"
    @click="handleClick"
  >
    <!-- the following is whitespace sensitive, do not indent -->
    <span class="line-content">{{ truncatedPrefix }}<span class="highlight">{{ highlight }}</span>{{ suffix }}</span>
  </div>
</template>

<style scoped>
.search-result-line {
  padding: 2px 8px;
  cursor: pointer;
  font-family: monospace;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-line:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
</style> 