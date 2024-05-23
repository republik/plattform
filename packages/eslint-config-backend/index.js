module.exports = {
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./packages/*/tsconfig.json'],
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/array-type': [
          'error',
          {
            default: 'array',
            readonly: 'array',
          },
        ],
      },
    },
    {
      files: ['**/*.js'],
      extends: ['standard', 'prettier'],
      rules: {
        camelcase: 'off',
      },
    },
    {
      files: ['**/*.jest.{js,ts}', '**/*.test.{js,ts}'],
      env: {
        jest: true,
      },
    },
  ],
}
