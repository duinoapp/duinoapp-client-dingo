import { Archive } from 'libarchive.js';


export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return;
  Archive.init({
    workerUrl: '/archive/worker-bundle.js',
  });
});