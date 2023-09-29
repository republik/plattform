import type { CodegenConfig } from '@graphql-codegen/cli'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

if (!process.env.DATO_CMS_API_URL) {
  throw new Error('Please set DATOCMS_API_URL in your .env file')
}
if (!process.env.DATO_CMS_API_TOKEN) {
  throw new Error('Please set DATOCMS_API_TOKEN in your .env file')
}

const datoCMSSchema = {
  [process.env.DATO_CMS_API_URL]: {
    headers: {
      Authorization: process.env.DATO_CMS_API_TOKEN,
      'X-Exclude-Invalid': 'true',
    },
  },
}

const config: CodegenConfig = {
  overwrite: true,

  generates: {
    'src/graphql/cms/gql/': {
      schema: datoCMSSchema,
      documents: ['src/graphql/cms/**/*.{ts,tsx}'],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          ItemId: 'number',
          IntType: 'number',
          Date: 'string',
          DateTime: 'string',
        },
      },
      plugins: [],
    },
    './graphql-dato-cms.schema.json': {
      schema: datoCMSSchema,
      documents: ['src/graphql/cms/**/*.{ts,tsx}'],
      plugins: ['introspection'],
    },
    'src/graphql/republik-api/gql/': {
      schema: process.env.NEXT_PUBLIC_API_URL,
      documents: ['src/graphql/republik-api/**/*.{ts,tsx}'],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          ItemId: 'number',
          IntType: 'number',
          Date: 'string',
          DateTime: 'string',
        },
      },
      plugins: [],
    },
    './graphql-republik-api.schema.json': {
      schema: process.env.NEXT_PUBLIC_API_URL,
      documents: ['src/graphql/republik-api/**/*.{ts,tsx}'],
      plugins: ['introspection'],
    },
  },
}

export default config
