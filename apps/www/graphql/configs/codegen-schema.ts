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
  documents: ['graphql/cms/**/*.{ts,tsx,gql,graphql}'],
}

const republikAPIConfig = {
  schema: process.env.NEXT_PUBLIC_API_URL,
  documents: ['graphql/republik-api/**/*.{ts,tsx,gql,graphql}'],
}

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './graphql/dato-cms.schema.graphql': {
      ...datoCMSConfig,
      plugins: ['schema-ast'],
    },
    './graphql/republik-api.schema.graphql': {
      ...republikAPIConfig,
      plugins: ['schema-ast'],
    },
  },
}

export default config
