module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['@republik/eslint-config-frontend'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-empty': 'warn',
    // Rules to no longer require React to be imported (React >=17)
    'react/jsx-uses-react': 'off',
    // 'react/react-in-jsx-scope': 'off', # TODO: Readd when code
  },
}
