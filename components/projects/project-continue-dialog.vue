<script setup lang="ts">
const projects = useProjects();

const dialog = ref(!!projects?.local.currentProjectId);
const projectName = computed(() => projects?.currentRef?.name);
const loading = ref(false);
const error = ref<string | null>(null);

const confirm = async (noLoad?: boolean) => {
  error.value = null;
  loading.value = true;
  
  try {
    await projects.init(noLoad);
    dialog.value = false;
  } catch (e) {
    error.value = 'Failed to load project. Please try again.';
    console.error('Project load error:', e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-dialog v-model="dialog" persistent max-width="400">
    <v-card>
      <v-card-title>
        Continue with existing project?
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-2"
        >
          {{ error }}
        </v-alert>
        You were previously working on <code>{{ projectName }}</code>, would you like to continue?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="loading"
          @click="confirm(true)"
        >
          Cancel
        </v-btn>
        <btn-primary
          :loading="loading"
          @click="confirm(false)"
        >
          Continue
        </btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template> 