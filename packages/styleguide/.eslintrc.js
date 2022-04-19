module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['@republik/eslint-config-frontend'],
  rules: {
    'react/react-in-jsx-scope': 'error',
  },
}
