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

const datoCMSConfig = {
  schema: [
    {
      [process.env.DATO_CMS_API_URL]: {
        headers,
      },
    },
  ],
  documents: ['src/graphql/cms/**/*.{ts,tsx}'],
}

const republikAPIConfig = {
  schema: process.env.NEXT_PUBLIC_API_URL,
  documents: ['src/graphql/republik-api/**/*.{ts,tsx}'],
}

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/graphql/cms/gql/': {
      ...datoCMSConfig,
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
    './graphql-cms.schema.json': {
      ...datoCMSConfig,
      plugins: ['introspection'],
    },
    'src/graphql/republik-api/gql/': {
      ...republikAPIConfig,
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
    './graphql-republik.schema.json': {
      ...republikAPIConfig,
      plugins: ['introspection'],
    },
  },
  // Ensure that the generated files are formatted directly to not cause diffs if there are no changes
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
}

export default config
