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

const isFileEditorVisible = computed(() => tabs.currentTab?.type === 'file');

</script>

<template>
  <div class="main-window">
    <main-window-tabs />
    <div v-show="isFileEditorVisible" class="main-window-area">
      <file-editor />
    </div>
    <welcome-area
      v-if="tabs.currentTab?.type === 'welcome'"
      class="main-window-area"
    />
  </div>
</template>

<style scoped>
.main-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-window-area {
  flex-grow: 1;
}
</style>
