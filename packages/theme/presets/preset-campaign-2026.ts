import { definePreset } from '@pandacss/dev'

export const presetCampaign2026 = definePreset({
  name: 'campaign-2026',
  conditions: {
    extend: {
      campaign2026: '[data-page-theme="campaign-2026"] &',
      campaign2026Inverted:
        '[data-page-theme="campaign-2026"]:where([data-theme-inverted]) &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign2026: {
            happyCherry: { value: '#e8819d' },
            frozenYogurt: { value: '#FED9E1' },
            justChocolate: { value: '#60031E' },
          },
        },
      },
      textStyles: {
        campaignHeading: {
          value: {
            fontFamily: 'republikSerif',
            fontWeight: 900,
            fontStyle: 'normal',
            fontSize: '3xl',
            lineHeight: 1.16667,
          },
        },
      },
    },
  },
})
