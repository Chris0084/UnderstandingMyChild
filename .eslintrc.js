module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors
  ],
  rules: {
    'prettier/prettier': 'error', // Force prettier formatting rules
  },
};