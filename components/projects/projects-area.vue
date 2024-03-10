<script setup lang="ts">
import { typeToIcon } from '@/utils/project-display';

const projects = useProjects();

const typeToText = (type: string) => {
  return projects.storageItems.find((item) => item.value === type)?.text || type;
};

</script>

<template>
  <div class="projects-area">
    <div class="project-actions d-flex justify-space-evenly mt-3">
      <v-btn
        @click="projects.initDialog('create')"
        class="project-action-btn"
        variant="tonal"
      >
        <v-icon>mdi-plus-circle-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Create a new project
        </v-tooltip>
      </v-btn>
      <v-btn
        @click="projects.initDialog('open')"
        class="project-action-btn"
        variant="tonal"
      >
        <v-icon>mdi-folder-open-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Open an existing project
        </v-tooltip>
      </v-btn>
      <v-btn
        @click="projects.initDialog('import')"
        class="project-action-btn"
        variant="tonal"
      >
        <v-icon>mdi-import</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Import a project zip file
        </v-tooltip>
      </v-btn>
    </div>
    <v-list density="compact" class="transparent">
      <v-list-item
        v-for="project in projects.projectItems"
        :key="project.value"
        :active="project.disabled"
        :class="{ 'text-primary': project.disabled }"
        @click="!project.disabled && projects.loadProject(project.value)"
      >
        <v-list-item-title>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                size="small"
                :icon="typeToIcon(project.type)"
              />
            </template>
            {{ typeToText(project.type) }}
          </v-tooltip>
          <span class="ml-2">
            {{ project.text }}
            <v-tooltip location="bottom" activator="parent">
              {{ project.text }}
            </v-tooltip>
          </span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<style lang="scss" scoped>

.project-action-btn {
  min-width: 0px !important;
}

</style>