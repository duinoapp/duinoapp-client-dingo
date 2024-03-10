<script setup lang="ts">
const projects = useProjects();

</script>

<template>
  <div class="examples-area">
    <v-list density="compact" class="transparent">
      <v-list-item
        v-for="project in projects.starterTemplates"
        :key="project.id"
        @click="projects.initDialog('example', project.id)"
        :title="project.name"
        :subtitle="project.description"
      />
    </v-list>
  </div>
</template>
