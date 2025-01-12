<script setup lang="ts">
import { typeToIcon } from '@/utils/project-display';

const projects = useProjects();
const tabs = useTabs();
const { panelState } = usePanels();

const removeProjectId = ref<string | null>(null);

const typeToText = (type: string) => {
  return projects.storageItems.find((item) => item.value === type)?.text || type;
};

const projectList = computed(() => projects.projectItems);

const handleLoadProject = async (id: string) => {
  try {
    await projects.loadProject(id);
    panelState.leftPanelType = 'explore';
  } catch (e) {
    console.error(e);
  }
};

const handleRemoveProject = async () => {
  if (!removeProjectId.value) return;
  await projects.removeProject(removeProjectId.value);
  removeProjectId.value = null;
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
        v-for="project in projectList"
        :key="project.value"
        :active="project.disabled"
        :class="{ 'text-primary': project.disabled, 'project-list-item': true }"
        @click="!project.disabled && handleLoadProject(project.value)"
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
        <template #append>
          <v-btn
            v-if="!project.disabled"
            size="x-small"
            icon="mdi-trash-can-outline"
            variant="text"
            class="project-list-item-action-btn"
            @click.stop="removeProjectId = project.value"
          />
          <v-btn
            v-else
            size="x-small"
            icon="mdi-cog-outline"
            variant="text"
            class="project-list-item-action-btn"
            @click.stop="tabs.addTab({ type: 'project-settings', name: 'Project Settings' })"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-dialog
      :model-value="!!removeProjectId"
      max-width="400"
      @update:model-value="removeProjectId = null"
    >
      <v-card>
        <v-card-title>
          Remove project?
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove this project?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="removeProjectId = null">Cancel</v-btn>
          <btn-primary @click="handleRemoveProject()">Remove</btn-primary>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>

.project-action-btn {
  min-width: 0px !important;
}

.project-list-item {
  .project-list-item-action-btn {
    opacity: 0;
  }

  &:hover {
    .project-list-item-action-btn {
      opacity: 1;
    }
  }
}

</style>
