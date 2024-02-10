import { createVuetify } from 'vuetify';
import type { ThemeDefinition } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const duinoDark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#5DA797',
    secondary: '#7F7CAF',
    accent: '#FF6542',
  },
};

const duinoLight: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#5DA797',
    secondary: '#7F7CAF',
    accent: '#FF6542',
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'duinoDark',
      themes: {
        duinoDark,
        duinoLight,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
