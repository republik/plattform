module.exports = {
  extends: [
    '@republik/eslint-config-frontend',
    'plugin:@next/next/recommended',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
}
