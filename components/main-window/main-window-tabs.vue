<script setup lang="ts">
import { useTheme } from 'vuetify';
import { getContentTypeFromFileName, getIconFromContentType, getIconColorFromContentType } from '../code/code-utils.ts';
import type { ProjectTab } from '@/composables/useTabs';

const theme = useTheme();
const tabs = useTabs();

const darkMode = computed(() => theme.global.current.value.dark);

// withDefaults(defineProps<
//   {
//     modelValue: ProjectTab | null,
//     files: Array<ProjectTab>,
//   }
// >(), {
//   modelValue: null,
//   files: () => [],
// });

// defineEmits(['update:modelValue', 'removeFile']);

const notClosable = (tab: ProjectTab) => ['welcome', 'start-project'].includes(tab.type);

const getIcon = (tab: ProjectTab) => {
  switch (tab.type) {
    case 'file':
      return getIconFromContentType(getContentTypeFromFileName(tab.path || ''));
    case 'settings':
      return 'mdi-cog';
    case 'welcome':
      return 'mdi-hand-wave';
    case 'start-project':
      return 'mdi-shimmer';
    case 'invaders':
      return 'mdi-space-invaders';
    case 'boards':
      return 'mdi-memory';
    case 'libraries':
      return 'mdi-book-open-variant';
    default:
      return 'mdi-file-question';
  }
};

const getIconColor = (tab: ProjectTab) => {
  if (tab.type === 'file') {
    return getIconColorFromContentType(getContentTypeFromFileName(tab.path || ''), darkMode.value);
  }
  return undefined;
};

</script>

<template>
  <v-slide-group
    :model-value="tabs.currentTab"
    class="file-tabs"
    show-arrows
    @update:model-value="$event && tabs.selectTab($event)"
  >
    <v-slide-group-item
      v-for="tab in tabs.projectTabs"
      :key="tab.id"
      v-slot="{ isSelected, toggle }"
      :value="tab"
    >
      <v-chip
        :color="isSelected ? 'primary' : undefined"
        class="file-tab px-4"
        close-icon="mdi-close"
        label
        :closable="!notClosable(tab)"
        @click="toggle"
        @click:close="tabs.closeTab(tab)"
      >
        <v-icon
          :color="getIconColor(tab)"
          size="x-small"
          start
        >
          {{ getIcon(tab) }}
        </v-icon>
        {{ tab.name }}
      </v-chip>
    </v-slide-group-item>
  </v-slide-group>
</template>

<style scoped lang="scss">

.file-tab {
  margin-right: 1px;
  border-radius: 0;

  &:not(.text-primary):deep(.v-chip__close) {
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
  }
  &:hover:deep(.v-chip__close) {
    opacity: 1;
  }
}

.file-tabs {
  height: 32px;
}

</style>
