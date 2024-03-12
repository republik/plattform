import type { CodegenConfig } from '@graphql-codegen/cli'

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const republikAPIConfig = {
  schema: process.env.NEXT_PUBLIC_API_URL,
  documents: ['graphql/republik-api/**/*.{ts,tsx,gql,graphql}'],
}

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './graphql/republik-api.schema.graphql': {
      ...republikAPIConfig,
      plugins: ['schema-ast'],
    },
  },
}

export default config
