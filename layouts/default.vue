<script setup lang="ts">

const projects = useProjects();

const dialog = ref(!!projects?.local.currentProjectId);

const confirm = (noLoad?: boolean) => {
  dialog.value = false;
  projects.init(noLoad);
};

const year = new Date().getFullYear();
const { public: { version } } = useRuntimeConfig();

</script>

<template>
  <v-app class="app">
    <v-navigation-drawer
      app
      rail
      permanent
    >
      <div class="pa-1 mt-2">
        <nuxtLink to="/">
          <v-img
            src="/duinoapp.svg"
            max-height="48"
            max-width="48"
          />
        </nuxtLink>
      </div>
      <left-menu />
    </v-navigation-drawer>
    <v-main>
      <slot />
      <v-dialog v-model="dialog" persistent max-width="400">
        <v-card>
          <v-card-title>
            Continue with existing project?
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="confirm(true)">
              Cancel
            </v-btn>
            <btn-primary @click="confirm(false)">
              Continue
            </btn-primary>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
    <v-footer class="d-flex" dense app>
      <div>
        DuinoApp &copy; {{ year }} - v{{ version }}
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.app {
  font-family: "Droid Sans Mono", "monospace", monospace;
  font-size: 14px;
}
</style>
