import { defineCliConfig } from 'sanity/cli'

const schemaPath =
  process.env.SANITY_SCHEMA_JSON ?? '../../../studio/schema.json'

export default defineCliConfig({
  // ...rest of config
  typegen: {
    path: './src/app/**/*.{ts,tsx,js,jsx}', // glob pattern to your typescript files. Can also be an array of paths
    schema: schemaPath, // path to your schema file, generated with 'sanity schema extract' command
    generates: './sanity/__generated__/types.ts', // path to the output file for generated type definitions
    overloadClientMethods: true, // set to false to disable automatic overloading the sanity client
  },
})
