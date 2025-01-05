<script setup lang="ts">
// import type { CodeFile } from '../code/code';
// import { getLanguageFromContentType } from './code-utils.ts';

// const files = ref([
//   {
//     name: 'index.html',
//     content: '<h1>Hello World</h1>',
//     contentType: 'text/html',
//   },
//   {
//     name: 'main.js',
//     content: 'console.log("Hello World");',
//     contentType: 'text/javascript',
//   },
//   {
//     name: 'styles.css',
//     content: 'h1 { color: red; }',
//     contentType: 'text/css',
//   },
//   {
//     name: 'project.ino',
// eslint-disable-next-line max-len
//     content: 'void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  Serial.println("Hello World");\n  delay(1000);\n}',
//     contentType: 'text/x-arduino',
//   },
//   {
//     name: 'readme.md',
//     content: '# Hello World\n\nThis is a test file.',
//     contentType: 'text/markdown',
//   },
// ] as CodeFile[]);
// const activeFile = ref((files.value[0] || null) as CodeFile | null);

// const addFile = (file: CodeFile) => {
//   files.value.push(file);
//   activeFile.value = file;
// };

// const removeFile = (file: CodeFile) => {
//   const index = files.value.indexOf(file);
//   if (index !== -1) {
//     files.value.splice(index, 1);
//   }
//   if (activeFile.value === file) {
//     activeFile.value = files.value[Math.max(index - 1, 0)] || null;
//   }
// };

const tabs = useTabs();
const loadedTypes = ref([] as string[]);

const currentType = computed(() => tabs.currentTab?.type);
const isFileEditorVisible = computed(() => currentType.value === 'file');

watch(currentType, async (type) => {
  if (type && !loadedTypes.value.includes(type)) {
    loadedTypes.value.push(type);
  }
}, { immediate: true });

</script>

<template>
  <div class="main-window">
    <main-window-tabs />
    <div v-show="isFileEditorVisible" class="main-window-area">
      <file-editor />
    </div>
    <welcome-area
      v-if="loadedTypes.includes('welcome')"
      v-show="currentType === 'welcome'"
      class="main-window-area"
    />
    <start-project-area
      v-if="loadedTypes.includes('start-project')"
      v-show="currentType === 'start-project'"
      class="main-window-area"
    />
    <invaders-area
      v-if="loadedTypes.includes('invaders')"
      v-show="currentType === 'invaders'"
      class="main-window-area"
    />
    <libraries-area
      v-if="loadedTypes.includes('libraries')"
      v-show="currentType === 'libraries'"
      class="main-window-area"
    />
    <boards-area
      v-if="loadedTypes.includes('boards')"
      v-show="currentType === 'boards'"
      class="main-window-area"
    />
    <project-settings-area
      v-if="loadedTypes.includes('project-settings')"
      v-show="currentType === 'project-settings'"
      class="main-window-area"
    />
    <settings-area
      v-if="loadedTypes.includes('settings')"
      v-show="currentType === 'settings'"
      class="main-window-area"
    />
  </div>
</template>

<style scoped>
.main-window {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
}

.main-window-area {
  flex-grow: 1;
  position: relative;
  height: calc(100% - 32px);
}
</style>
