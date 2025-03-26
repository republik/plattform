export default {
  schema: 'path/to/schema.graphql',
  documents: ['graphql/queries/**/*.graphql', 'graphql/fragments/**/*.graphql'],
  generates: {
    'path/to/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
}
