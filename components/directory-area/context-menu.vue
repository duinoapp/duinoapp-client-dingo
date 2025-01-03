<script setup lang="ts">
import { useFileActions } from '@/composables/useFileActions';

const fileActions = useFileActions();
const tabs = useTabs();

const contextMenu = computed(() => fileActions.contextMenu);
const isIno = computed(() => contextMenu.value?.path.endsWith('.ino'));
const isRoot = computed(() => contextMenu.value?.path === '');
const isProtected = computed(() => isRoot.value || isIno.value);
const isTab = computed(() => contextMenu.value?.isTab);

const handleAction = (action: string) => {
  if (!contextMenu.value) return;
  
  const { path, isDirectory } = contextMenu.value;

  const folder = isDirectory ? path : path.split('/').slice(0, -1).join('/');
  
  switch (action) {
    case 'create-file':
      fileActions.showCreateDialog(folder, 'file');
      break;
    case 'create-folder':
      fileActions.showCreateDialog(folder, 'folder');
      break;
    case 'rename':
      fileActions.showRenameDialog(path, isDirectory);
      break;
    case 'move':
      fileActions.showMoveDialog(path, isDirectory);
      break;
    case 'delete':
      fileActions.showDeleteDialog(path, isDirectory);
      break;
    case 'close':
      tabs.closeTab(tabs.findTab('file', path) as ProjectTab);
      break;
  }
  
  fileActions.closeContextMenu();
};

</script>

<template>
  <v-menu
    v-model="contextMenu.isVisible"
    :target="[contextMenu.x, contextMenu.y]"
    
    close-on-content-click
    min-width="150"
  >
    <v-list
      density="compact"
      class="context-menu"
    >
      <v-list-item
        v-if="!isTab"
        prepend-icon="mdi-file-plus"
        @click="handleAction('create-file')"
      >
        Create File Here
      </v-list-item>
      <v-list-item
        v-if="!isTab"
        prepend-icon="mdi-folder-plus"
        @click="handleAction('create-folder')"
      >
        Create Folder Here
      </v-list-item>
      <v-list-item
        v-if="isTab"
        prepend-icon="mdi-close"
        @click="handleAction('close')"
      >
        Close
      </v-list-item>

      <v-divider v-if="!isProtected" />
      <v-list-item
        v-if="!isProtected"
        prepend-icon="mdi-pencil"
        @click="handleAction('rename')"
      >
        Rename
      </v-list-item>
      <v-list-item
        v-if="!isProtected"
        prepend-icon="mdi-folder-move"
        @click="handleAction('move')"
      >
        Move
      </v-list-item>
      <v-divider v-if="!isProtected" />
      <v-list-item
        v-if="!isProtected"
        prepend-icon="mdi-delete"
        color="error"
        @click="handleAction('delete')"
      >
        Delete
      </v-list-item>
    </v-list>
  </v-menu>
</template> 