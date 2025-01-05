<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme();
const settings = useSettings();


watch(() =>settings.isDarkTheme, (newIsDarkTheme) => {
  theme.global.name.value = newIsDarkTheme ? 'duinoDark' : 'duinoLight';
}, { immediate: true });

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
      <project-continue-dialog />
      <compatibility-dialog />
      <file-action-dialogs />
      <context-menu />
    </v-main>
    <!-- <v-footer class="d-flex" dense app>
      <div>
        DuinoApp &copy; {{ year }} - v{{ version }}
      </div>
    </v-footer> -->
  </v-app>
</template>

<style scoped>
.app {
  font-family: "Roboto Mono", "Droid Sans Mono", "monospace", monospace;
  font-optical-sizing: auto;
  font-style: normal;
  font-size: 14px;
}
</style>
