import { defineConfig } from '@pandacss/dev'
import { presets } from '@republik/theme/presets'

export default defineConfig({
  preflight: true,
  prefix: 'r',
  // strictTokens: true,

  presets,

  theme: {
    extend: {
      containerSizes: {
        sm: '375px',
        md: '768px',
        lg: '1025px',
      },
    },
  },

  // Files where CSS is extracted from
  // NOTE: must include any component packages that are imported in the app
  include: ['./{pages,components,src}/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Package name where style functions get imported from
  importMap: '@republik/theme',

  // Output directory for generated files.
  // NOTE: this must be directory where `importMap` module resolves to
  outdir: '../../packages/theme/__generated__',
})
