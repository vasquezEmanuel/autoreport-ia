'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },
  rules: {
    'no-var': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    'no-throw-literal': 'error',
    'no-async-promise-executor': 'error',
    'no-return-await': 'error',
    'no-console': 'warn',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'require-await': 'warn',
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'vitest.config.js'],
  overrides: [
    {
      files: ['src/__tests__/**/*.test.js'],
      env: {
        node: true,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  ],
};
