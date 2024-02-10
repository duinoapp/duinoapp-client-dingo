<script setup lang="ts">

const year = new Date().getFullYear();
const { public: { version } } = useRuntimeConfig();

</script>

<template>
  <v-app>
    <v-app-bar flat app>
      <v-toolbar-title>
        <div class="d-flex align-center">
          <v-img
            class="mr-2"
            src="/duinoapp.svg"
            max-height="48"
            max-width="48"
          />
          <div class="text-brandon">
            DuinoApp
          </div>
        </div>
      </v-toolbar-title>
      <v-spacer />
      <btn-github class="mr-2" />
      <btn-discord class="mr-2" />
      <btn-primary to="/code" nuxt>
        Start Coding
      </btn-primary>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
    <v-footer class="d-flex" app>
      <div>
        DuinoApp &copy; {{ year }} - v{{ version }}
      </div>
    </v-footer>
  </v-app>
</template>
