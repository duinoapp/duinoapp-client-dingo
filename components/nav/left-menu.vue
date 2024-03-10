<script setup lang="ts">

const { panelState } = usePanels();
const tabs = useTabs();

interface MenuItem {
  name: string;
  icon: string;
  action?: () => void;
  isActive?: boolean;
}

const menuItems = computed<MenuItem[]>(() => [
  {
    name: 'File Explorer',
    icon: 'mdi-file-document-multiple-outline',
    action: () => panelState.leftPanelType = 'explore',
    isActive: panelState.leftPanelType === 'explore',
  },
  {
    name: 'Search',
    icon: 'mdi-magnify',
    action: () => panelState.leftPanelType = 'search',
    isActive: panelState.leftPanelType === 'search',
  },
  {
    name: 'Projects',
    icon: 'mdi-folder-open-outline',
    action: () => panelState.leftPanelType = 'projects',
    isActive: panelState.leftPanelType === 'projects',
  },
  {
    name: 'Examples',
    icon: 'mdi-folder-star-outline',
    action: () => panelState.leftPanelType = 'examples',
    isActive: panelState.leftPanelType === 'examples',
  },
  {
    name: 'Boards',
    icon: 'mdi-memory',
    action: () => tabs.addTab({ type: 'boards', name: 'Boards' }),
    isActive: tabs.currentTab?.type === 'boards',
  },
  {
    name: 'Libraries',
    icon: 'mdi-book-open-variant',
    action: () => tabs.addTab({ type: 'libraries', name: 'Libraries' }),
    isActive: tabs.currentTab?.type === 'libraries',
  },
  {
    name: 'Compile Servers',
    icon: 'mdi-server',
    action: () => panelState.leftPanelType = 'servers',
    isActive: panelState.leftPanelType === 'servers',
  },
  {
    name: 'Settings',
    icon: 'mdi-cog-outline',
    action: () => tabs.addTab({ type: 'settings', name: 'Settings' }),
    isActive: tabs.currentTab?.type === 'settings',
  },
]);

</script>

<template>
  <v-list dense>
    <v-list-item
      v-for="item in menuItems"
      :key="item.name"
      :active="item.isActive"
      @click="item.action"
    >
      <v-list-item-icon>
        <v-icon
          :color="item.isActive ? 'primary' : undefined"
          size="large"
        >
          {{ item.icon }}
        </v-icon>
      </v-list-item-icon>
      <v-tooltip activator="parent" location="right">{{ item.name }}</v-tooltip>
      <!-- <v-list-item-content>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item-content> -->
    </v-list-item>
  </v-list>
</template>