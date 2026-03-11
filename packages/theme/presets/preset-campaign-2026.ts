import { definePreset } from '@pandacss/dev'

export const presetCampaign2026 = definePreset({
  name: 'campaign-2026',
  conditions: {
    extend: {
      campaign2026Bright:
        '[data-page-theme="campaign-2026"] [data-theme="bright"] &',
      campaign2026Light:
        '[data-page-theme="campaign-2026"] [data-theme="light"] &',
      campaign2026Dark:
        '[data-page-theme="campaign-2026"] [data-theme="dark"] &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign2026: {
            happyCherry: { value: '#F0084C' },
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
        heavy: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontSize: '20px',
            lineHeight: 1.5,
            fontWeight: 500,
          },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.frozenYogurt}',
              _campaign2026Light: '{colors.campaign2026.happyCherry}',
              _campaign2026Dark: '{colors.campaign2026.happyCherry}',
            },
          },
          background: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.happyCherry}',
              _campaign2026Light: '{colors.campaign2026.frozenYogurt}',
              _campaign2026Dark: '{colors.campaign2026.justChocolate}',
            },
          },
          tag: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.justChocolate}',
              _campaign2026Light: '{colors.campaign2026.justChocolate}',
              _campaign2026Dark: '{colors.campaign2026.frozenYogurt}',
            },
          },
          tagText: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.frozenYogurt}',
              _campaign2026Light: '{colors.campaign2026.frozenYogurt}',
              _campaign2026Dark: '{colors.campaign2026.justChocolate}',
            },
          },
          button: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.justChocolate}',
              _campaign2026Light: '{colors.campaign2026.justChocolate}',
              _campaign2026Dark: '{colors.campaign2026.happyCherry}',
            },
          },
          radioText: {
            value: {
              _campaign2026Bright: 'white',
              _campaign2026Light: '{colors.campaign2026.happyCherry}',
              _campaign2026Dark: '{colors.campaign2026.frozenYogurt}',
            },
          },
          radioTextChecked: {
            value: {
              _campaign2026Bright: '{colors.campaign2026.happyCherry}',
              _campaign2026Light: 'white',
              _campaign2026Dark: '{colors.campaign2026.justChocolate}',
            },
          },
          radioOutline: {
            value: {
              _campaign2026Bright: 'rgba(255, 255, 255, 0.4)',
              _campaign2026Light: 'rgba(240, 8, 76, 0.4)',
              _campaign2026Dark: 'rgba(255, 255, 255, 0.4)',
            },
          },
          radioChecked: {
            value: {
              _campaign2026Bright: 'white',
              _campaign2026Light: '{colors.campaign2026.happyCherry}',
              _campaign2026Dark: '{campaign2026.frozenYogurt}',
            },
          },
        },
      },
    },
  },
})
