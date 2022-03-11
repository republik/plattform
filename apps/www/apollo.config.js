module.exports = {
  client: {
    service: {
      name: 'republik-backend',
      url: 'http://localhost:5010/graphql',
      localSchemaFile: './graphql-schema.gql',
    },
    includes: [
      './components/**/*.{ts,tsx}',
      './lib/**/*.{ts,tsx}',
      './pages/**/*.{ts,tsx}',
    ],
  },
}
