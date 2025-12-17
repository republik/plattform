import { defineConfig } from '@pandacss/dev'
import { presets } from '@republik/theme/presets'

export default defineConfig({
  preflight: true,
  prefix: 'r',
  // strictTokens: true,

  presets,

  // Files where CSS is extracted from
  // NOTE: must include any component packages that are imported in the app
  include: ['./{pages,lib}/**/*.{js,jsx,ts,tsx,mdx}'],

  // Files to exclude
  exclude: [],

  // Package name where style functions get imported from
  importMap: '@republik/theme',

  // Output directory for generated files.
  // NOTE: this must be directory where `importMap` module resolves to
  outdir: '../packages/theme/__generated__',
})
