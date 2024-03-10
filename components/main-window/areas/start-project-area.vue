<script setup lang="ts">
// import type { FilesMultitoolType } from '@duinoapp/files-multitool';

// const projects = useProjects();
const tabs = useTabs();

// const openInoFile = async (path: string) => {

const openInvaders = async () => {
  console.log('openInvaders');
  tabs.addTab({
    type: 'invaders',
    name: 'Invaders',
  });
};

</script>

<template>
  <p>
    start-project
    <btn-primary @click="openInvaders">
      Invaders
    </btn-primary>
  </p>
</template>
