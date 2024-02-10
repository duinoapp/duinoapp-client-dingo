module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  extends: [
    'eslint-config-airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'plugin:nuxt/recommended',
  ],
  settings: {
    'import/resolver': {
      node: true,
      typescript: {
        extensions: ['.js', '.ts', '.d.ts', '.vue', '.mjs', '.json', '.css', '.scss'],
      },
    },
  },
  rules: {
    semi: 'error',
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    'vue/max-attributes-per-line': ['error', {
      singleline: 4,
      multiline: 1,
    }],
  },
  overrides: [
    {
      files: ['layouts/*.vue', 'pages/**/*.vue'],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
  ],
  excludeFiles: [
    'public/**/*',
  ],
};
