import { defineStore } from 'pinia';

type FileActionDialogType = 'create' | 'rename' | 'move' | 'delete' | null;
type FileActionType = 'file' | 'folder';

interface FileActionDialog {
  type: FileActionDialogType;
  actionType?: FileActionType;
  path?: string;
  parentPath?: string;
  name?: string;
  file?: File;
}

interface ContextMenu {
  x: number;
  y: number;
  target: Element | null;
  path: string;
  isDirectory: boolean;
  isTab?: boolean;
  isVisible?: boolean;
}

export const useFileActions = defineStore('fileActions', () => {
  const projects = useProjects();
  const tabs = useTabs();

  // Dialog state
  const dialog = reactive<FileActionDialog>({
    type: null,
    actionType: undefined,
    path: undefined,
    parentPath: undefined,
    name: undefined,
    file: undefined,
  });

  // Context menu state
  const contextMenu = reactive<ContextMenu>({
    x: 0,
    y: 0,
    target: null,
    path: '',
    isDirectory: false,
    isVisible: false,
  });

  // Actions

  const clearDialog = () => {
    dialog.type = null;
    dialog.actionType = undefined;
    dialog.path = undefined;
    dialog.parentPath = undefined;
    dialog.name = undefined;
    dialog.file = undefined;
  };

  const showCreateDialog = (parentPath: string = '', type: FileActionType = 'file', file?: File) => {
    clearDialog();
    dialog.type = 'create';
    dialog.actionType = type;
    dialog.parentPath = parentPath;
    dialog.file = file;
    dialog.name = file?.name ?? '';
  };

  const showRenameDialog = (path: string, isDirectory: boolean) => {
    clearDialog();
    const parts = path.split('/');
    const name = parts.pop() || '';
    const parentPath = parts.join('/');
    dialog.type = 'rename';
    dialog.actionType = isDirectory ? 'folder' : 'file';
    dialog.path = path;
    dialog.parentPath = parentPath;
    dialog.name = name;
  };

  const showMoveDialog = (path: string, isDirectory: boolean) => {
    clearDialog();
    const parts = path.split('/');
    const name = parts.pop() || '';
    const parentPath = parts.join('/');
    dialog.type = 'move';
    dialog.actionType = isDirectory ? 'folder' : 'file';
    dialog.path = path;
    dialog.parentPath = parentPath;
    dialog.name = name;
  };

  const showDeleteDialog = (path: string, isDirectory: boolean) => {
    clearDialog();
    dialog.type = 'delete';
    dialog.actionType = isDirectory ? 'folder' : 'file';
    dialog.path = path;
  };

  const closeDialog = () => {
    dialog.type = null;
  };

  const showContextMenu = ({ target, path, isDirectory, isTab = false, x, y }: ContextMenu) => {
    contextMenu.target = target;
    contextMenu.path = path;
    contextMenu.isDirectory = isDirectory;
    contextMenu.isTab = isTab;
    contextMenu.isVisible = true;
    contextMenu.x = x;
    contextMenu.y = y;
  };

  const closeContextMenu = () => {
    contextMenu.isVisible = false;
    contextMenu.target = null;
  };

  const handleContextMenu = (e: MouseEvent, path: string, isDirectory: boolean) => {
    e.preventDefault();
    if (contextMenu.isVisible) closeContextMenu();
    else showContextMenu({ target: e.target as Element, path, isDirectory, x: e.clientX, y: e.clientY });
  };

  const handleTabContextMenu = (e: MouseEvent, path?: string) => {
    e.preventDefault();
    if (contextMenu.isVisible) closeContextMenu();
    if (!path) return;
    else showContextMenu({ target: e.target as Element, path, isDirectory: false, isTab: true, x: e.clientX, y: e.clientY });
  };

  // File operations
  const createFile = async (parentPath: string, name: string, content: string | ArrayBuffer = '') => {
    if (!projects.storage) return;
    const path = `${parentPath}/${name}`.replace(/\/+/g, '/');
    let contentBuffer: ArrayBuffer;
    if (typeof content === 'string') {
      contentBuffer = new TextEncoder().encode(content);
    } else {
      contentBuffer = content;
    }
    await projects.storage.writeFile(path, contentBuffer);
    tabs.openFileTab(path);
  };

  const createFolder = async (parentPath: string, name: string) => {
    if (!projects.storage) return;
    const path = `${parentPath}/${name}`.replace(/\/+/g, '/');
    await projects.storage.mkdir(path);
  };

  const rename = async (oldPath: string, newName: string) => {
    if (!projects.storage) return;
    const parts = oldPath.split('/');
    parts.pop();
    const newPath = `${parts.join('/')}/${newName}`.replace(/\/+/g, '/');
    await projects.storage.rename(oldPath, newPath);
  };

  const move = async (oldPath: string, newParentPath: string) => {
    if (!projects.storage) return;
    const name = oldPath.split('/').pop() || '';
    const newPath = `${newParentPath}/${name}`.replace(/\/+/g, '/');
    await projects.storage.rename(oldPath, newPath);
  };

  const remove = async (path: string, isDirectory: boolean) => {
    console.log('remove', path, isDirectory);
    if (!projects.storage) return;
    if (isDirectory) {
      await projects.storage.rmdir(path, true);
    } else {
      await projects.storage.rm(path);
    }
  };

  return {
    dialog,
    contextMenu,
    showCreateDialog,
    showRenameDialog,
    showMoveDialog,
    showDeleteDialog,
    closeDialog,
    showContextMenu,
    closeContextMenu,
    handleContextMenu,
    handleTabContextMenu,
    createFile,
    createFolder,
    rename,
    move,
    remove,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFileActions, import.meta.hot));
} 