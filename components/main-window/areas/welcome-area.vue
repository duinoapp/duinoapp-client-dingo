<script setup lang="ts">
import type { FilesMultitoolType } from '@duinoapp/files-multitool';

const projects = useProjects();

const testProject = () => {
  console.log('test project');
  projects.projectFromTemplate('indexed-db' as FilesMultitoolType, 'blink', 'test-project').catch(console.error);
};

</script>

<template>
  <p>
    welcome
    <btn-primary @click="testProject">
      Test Project
    </btn-primary>
  </p>
</template>
