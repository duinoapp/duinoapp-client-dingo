//import version from './package.json'
import { version } from './package.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $development: {
    devtools: { enabled: true },
    runtimeConfig: {
      public: {
        devCompileServer: 'http://localhost:3030',
      },
    },
  },
  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
  ],
  typescript: {
    strict: true
  },
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css',
    '~/assets/global.scss'
  ],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: ['./stores'],
  },
  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true },
    '/code/': { ssr: false },
    '/code/**': { ssr: false },
  },
  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      crawlLinks: true,
    },
  },
  runtimeConfig: {
    public: {
      version,
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'DuinoApp',
      theme_color: '#5DA797',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        }
      ],
    },
  },
  app: {
    head: {
      title: 'DuinoApp',
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico',
          sizes: 'any',
        },
        {
          rel: 'icon',
          href: '/duinoapp.svg',
          type: 'image/svg+xml',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon-180x180.png',
        },
      ],
    },
  },
});
