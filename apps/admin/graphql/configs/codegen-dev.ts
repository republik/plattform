import type { CodegenConfig } from '@graphql-codegen/cli'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './graphql/republik-api/__generated__/gql/': {
      schema: {
        [process.env.NEXT_PUBLIC_API_URL]: {
          headers: {
            'x-api-gateway-client': 'admin',
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
