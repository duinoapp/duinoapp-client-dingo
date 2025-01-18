<script setup lang="ts">

const compiler = useCompiler();
const uploader = useUploader();
const tabs = useTabs();
const panels = usePanels();
const projects = useProjects();
const servers = useServers();

const error = computed(() => {
  if (!servers.currentServerLive) {
    return { message: 'Compile server is not available', title: 'Server Error', type: 'server' };
  }
  if (compiler.lastError) {
    return { message: compiler.lastError, title: 'Compiler Error', type: 'compiler' };
  }
  if (uploader.lastError) {
    return { message: uploader.lastError, title: 'Upload Error', type: 'uploader' };
  }
  return undefined;
});

const check = async () => {
  await compiler.compile();
};

const upload = async () => {
  await uploader.upload();
};

</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <v-icon v-show="error" v-bind="props" color="warning" class="mr-4">
        mdi-alert-outline
      </v-icon>
    </template>
    <div class="text-center">
      <div class="font-weight-bold">
        {{ error?.title }}
      </div>
      {{ error?.message }}
    </div>
  </v-tooltip>
  <v-btn
    :disabled="!projects.currentProjectId"
    density="compact"
    class="mr-2"
    icon
    @click="panels.panelState.leftPanelType = 'servers'"
  >
    <v-icon size="x-small" :color="error?.type === 'server' ? 'warning' : 'default'">
      mdi-server
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Select Compile Server
    </v-tooltip>
  </v-btn>
  <v-btn
    :disabled="!projects.currentProjectId"
    density="compact"
    class="mr-2"
    icon
    @click="tabs.openGeneralTab('boards')"
  >
    <v-icon>
      mdi-chip
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Select Board
    </v-tooltip>
  </v-btn>
  <v-btn
    :loading="compiler.compiling"
    :disabled="uploader.uploading || !projects.currentProjectId"
    density="compact"
    class="mr-2"
    icon
    @click="check"
  >
    <v-icon :color="error?.type === 'compiler' ? 'warning' : 'default'">
      mdi-check
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Verify & Compile
    </v-tooltip>
  </v-btn>
  <v-btn
    :loading="uploader.uploading"
    :disabled="compiler.compiling"
    density="compact"
    icon
    @click="upload"
  >
    <v-icon :color="error?.type === 'uploader' ? 'warning' : 'default'">
      mdi-arrow-right
    </v-icon>
    <v-tooltip
      activator="parent"
      location="top"
    >
      Compile &amp; Upload
    </v-tooltip>
  </v-btn>
</template>
