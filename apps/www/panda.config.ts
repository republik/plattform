import { defineConfig } from '@pandacss/dev'
import { presetRepublik } from '@app/theme/preset'
import { presetChallengeAccepted } from '@app/theme/preset-challenge-accepted'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [presetRepublik, presetChallengeAccepted],

  // conditions:
  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'src/styled-system',
  // strictTokens: true,
})
