import { CodegenConfig } from '@graphql-codegen/cli'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const config: CodegenConfig = {
  schema: process.env.API_URL,
  documents: [
    'components/**/*.tsx',
    'components/**/*.ts',
    'pages/**/*.tsx',
    'pages/**/*.ts',
    'lib/**/*.tsx',
    'lib/**/*.ts',
  ],
  generates: {
    './__generated__/graphql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
  ignoreNoDocuments: true,
}

export default config
