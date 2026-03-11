'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
  },

  extends: [
    'eslint:recommended',
    'prettier',
  ],

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },

  rules: {
    // ── Errores que deben corregirse obligatoriamente ──────────────
    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],
    'no-throw-literal': 'error',
    'no-async-promise-executor': 'error',
    'no-return-await': 'error',

    // ── Advertencias — malas prácticas a evitar ────────────────────
    'no-console': 'warn',
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'require-await': 'warn',
    'no-shadow': 'warn',
  },

  ignorePatterns: [
    'node_modules/',
    'coverage/',
  ],
};