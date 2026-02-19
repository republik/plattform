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
  generates: {
    './graphql/cms/__generated__/gql/': {
      schema: {
        [process.env.DATO_CMS_API_URL]: {
          headers,
        },
      },
      documents: ['./graphql/cms/**/*.{ts,tsx,gql,graphql}'],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
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
    './graphql/republik-api/__generated__/gql/': {
      schema: {
        [process.env.NEXT_PUBLIC_API_URL]: {
          headers: {
            'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'www',
            'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
          },
        },
      },
      documents: ['./graphql/republik-api/**/*.{ts,tsx,gql,graphql}'],
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
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
  },
}

export default config
