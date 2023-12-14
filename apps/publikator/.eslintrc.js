module.exports = {
  extends: [
    '@republik/eslint-config-frontend',
    'plugin:@next/next/recommended',
  ],
  rules: {
    'no-control-regex': 'off',
    'no-html-link-for-pages': 'off',
  },
}
