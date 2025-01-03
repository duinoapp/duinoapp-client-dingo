<script setup lang="ts">
import { useTheme } from 'vuetify';
import { getContentTypeFromFileName, getIconFromContentType, getIconColorFromContentType } from '../code/code-utils.ts';
import type { ProjectTab } from '@/composables/useTabs';
import VueDraggable from 'vuedraggable';

const theme = useTheme();
const tabs = useTabs();

const darkMode = computed(() => theme.global.current.value.dark);
const tabsContainer = ref<HTMLElement | null>(null);

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
    case 'project-settings':
      return 'mdi-folder-cog-outline';
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

// Handle drag & drop reordering through v-model
const projectTabs = computed({
  get: () => tabs.projectTabs,
  set: (value) => {
    // Update the tabs order in the store
    tabs.updateTabsOrder(value);
  }
});

// Transform vertical scroll to horizontal
const transformScroll = (event: WheelEvent) => {
  if (!tabsContainer.value || !event.deltaY) return;
  
  const container = tabsContainer.value.querySelector('.tabs-scroll-container');
  if (!container) return;

  event.preventDefault();
  container.scrollLeft += (event.deltaY / 2) + event.deltaX;
};

// Scroll active tab into view
watch(() => tabs.currentTab, (newTab) => {
  if (!newTab) return;
  nextTick(() => {
    const tabElement = document.querySelector(`[data-tab-id="${newTab.id}"]`) as HTMLElement;
    if (tabElement) {
      tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  });
});

onMounted(() => {
  if (tabsContainer.value) {
    tabsContainer.value.addEventListener('wheel', transformScroll);
  }
});

onBeforeUnmount(() => {
  if (tabsContainer.value) {
    tabsContainer.value.removeEventListener('wheel', transformScroll);
  }
});

</script>

<template>
  <div 
    ref="tabsContainer"
    class="file-tabs"
  >
    <div class="tabs-scroll-container">
      <VueDraggable
        v-model="projectTabs"
        :animation="150"
        item-key="id"
        class="tabs-draggable"
        handle=".file-tab"
        :group="{ name: 'tabs' }"
      >
        <template #item="{ element: tab }">
          <div
            :data-tab-id="tab.id"
            class="tab-item"
          >
            <v-chip
              :color="tab.isCurrent ? 'primary' : undefined"
              class="file-tab px-4 py-2"
              close-icon="mdi-close"
              label
              :closable="!notClosable(tab)"
              @click="tabs.selectTab(tab)"
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
          </div>
        </template>
      </VueDraggable>
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-tabs {
  height: 46px;
  position: relative;
  overflow: hidden;
}

.tabs-scroll-container {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: thin;
  height: 46px;
  
  /* Hide scrollbar for Chrome/Safari/Opera */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.5);
    border-radius: 3px;
  }
}

.tabs-draggable {
  display: flex;
  align-items: center;
}

.tab-item {
  display: inline-flex;
  align-items: center;
}

.file-tab {
  height: 40px;
  margin-right: 1px;
  border-radius: 0;
  user-select: none;
  white-space: nowrap;
  // cursor: move; /* Indicate draggable */

  &:not(.text-primary):deep(.v-chip__close) {
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
  }
  &:hover:deep(.v-chip__close) {
    opacity: 1;
  }
}
</style>
