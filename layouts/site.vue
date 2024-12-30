<script setup lang="ts">

const year = new Date().getFullYear();
const { public: { version } } = useRuntimeConfig();

</script>

<template>
  <v-app>
    <v-app-bar rounded="pill" scroll-behavior="elevate" class="navbar">
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
      <btn-primary
        to="/code"
        class="d-none d-md-flex"
        nuxt
      >
        Start Coding
      </btn-primary>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
    <v-footer class="d-flex">
      <div>
        DuinoApp &copy; {{ year }} - v{{ version }}
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped lang="scss">

.navbar {
  max-width: calc(100% - 32px);
  transform: translate(16px, 0)!important;
  margin-top: 16px;
  padding: 0 24px;

  @media (min-width: 960px) {
    max-width: 900px;
    transform: translate(calc(50vw - 450px), 0)!important;
  }

  @media (min-width: 1280px) {
    max-width: 1200px;
    transform: translate(calc(50vw - 600px), 0)!important;
  }

  @media (min-width: 1920px) {
    max-width: 1800px;
    transform: translate(calc(50vw - 900px), 0)!important;
  }
}

</style>
