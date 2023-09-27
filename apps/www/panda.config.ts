import { defineConfig } from '@pandacss/dev'
import { republikPreset } from '@app/theme/preset'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [republikPreset],

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'src/styled-system',
})
