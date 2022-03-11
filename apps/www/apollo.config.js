module.exports = {
  client: {
    service: {
      name: 'republik-backend',
      url: 'http://localhost:5010/graphql',
    },
    includes: [
      './components/**/*.{js,ts,tsx}',
      './lib/**/*.{js,ts,tsx}',
      './pages/**/*.{js,ts,tsx}',
    ],
  },
}
