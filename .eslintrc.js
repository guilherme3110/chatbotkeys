/* eslint config for Vue 3 + Vite + Naive UI */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Desativa erro sobre v-model com argumento (Vue 3 usa essa sintaxe)
    'vue/no-v-model-argument': 'off'
  }
}
