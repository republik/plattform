import type { CodegenConfig } from '@graphql-codegen/cli'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

if (!process.env.DATO_CMS_API_URL) {
  throw new Error('Please set DATOCMS_API_URL in your .env file')
}
if (!process.env.DATO_CMS_API_TOKEN) {
  throw new Error('Please set DATOCMS_API_TOKEN in your .env file')
}

const headers = {
  Authorization: process.env.DATO_CMS_API_TOKEN,
  'X-Exclude-Invalid': 'true',
}

if (process.env.DATO_CMS_ENVIRONMENT) {
  headers['X-Environment'] = process.env.DATO_CMS_ENVIRONMENT
}

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [process.env.DATO_CMS_API_URL]: {
        headers,
      },
    },
  ],
  documents: ['src/graphql/cms/**/*.{ts,tsx}'],
  generates: {
    'src/graphql/gql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          ItemId: 'string',
          IntType: 'number',
          Date: 'string',
          DateTime: 'string',
        },
      },
      plugins: [],
    },
    './graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
}

export default config
