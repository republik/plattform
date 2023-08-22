import { CodegenConfig } from '@graphql-codegen/cli'

// Since this script is run outside of the context of Next.js,
// we need to manually load the environment variables.
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * This configuration generates TypeScript types based on the
 * schema.gql file stored in the `apps/api` folder.
 * It also generates types for all queries that very created using the
 * `gql` function that was exported in the `graphql/__generated__` folder.
 */
const config: CodegenConfig = {
  schema: process.env.API_URL,

  documents: ['./**/*.{ts,tsx}'],
  generates: {
    './graphql/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
