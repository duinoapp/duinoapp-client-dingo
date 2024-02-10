import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return;
  nuxtApp.vueApp.use(VueMonacoEditorPlugin, {
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
    },
  });
});
