<script setup lang="ts">

const year = new Date().getFullYear();
const { public: { version } } = useRuntimeConfig();
const { isSerialSupported } = useBrowserCompat();

</script>

<template>
  <v-app>
    <v-app-bar rounded="pill" scroll-behavior="elevate" class="navbar">
      <v-toolbar-title>
        <nuxt-link to="/" class="d-flex align-center title-link">
          <v-img
            class="mr-2"
            src="/duinoapp.svg"
            max-height="48"
            width="48"
            max-width="48"
          />
          <div class="text-brandon" style="min-width: 100px;">
            DuinoApp
          </div>
        </nuxt-link>
      </v-toolbar-title>
      <v-spacer />
      <btn-github class="mr-2" />
      <btn-discord class="mr-2" />
      <btn-primary
        :to="isSerialSupported ? '/code' : null"
        class="d-none d-md-flex"
        nuxt
        :disabled="!isSerialSupported"
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
      <v-spacer />
      <v-btn to="/privacy" variant="text" size="small" prepend-icon="mdi-shield-check">
        Privacy Policy
      </v-btn>
      <v-btn to="/terms" variant="text" size="small" prepend-icon="mdi-scale-balance">
        Terms of Service
      </v-btn>
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

  .v-toolbar-title {
    flex: unset;

    .title-link {
      text-decoration: none;
      color: inherit;
    }
  }
}

</style>
