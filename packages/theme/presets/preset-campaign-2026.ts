import { definePreset } from '@pandacss/dev'

export const presetCampaign2026 = definePreset({
  name: 'campaign-2026',
  conditions: {
    extend: {
      campaign26: '[data-page-theme="campaign-2026"] &',
      campaign26Bright:
        '[data-page-theme="campaign-2026"] [data-theme="bright"] &',
      campaign26Light:
        '[data-page-theme="campaign-2026"] [data-theme="light"] &, [data-theme="light"] [data-page-theme="campaign-2026"] &',
      campaign26Dark:
        '[data-page-theme="campaign-2026"] [data-theme="dark"] &, [data-theme="dark"] [data-page-theme="campaign-2026"] &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign26: {
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
            fontSize: '36px',
            lineHeight: 1.16667,
          },
        },
        campaignSubhead: {
          value: {
            fontFamily: 'republikSerif',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '28px',
            lineHeight: 1.2,
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
          campaign26: {
            value: {
              _campaign26Bright: '{colors.campaign26.frozenYogurt}',
              _campaign26Light: '{colors.campaign26.happyCherry}',
              _campaign26Dark: '{colors.campaign26.frozenYogurt}',
            },
          },
          campaign26Background: {
            value: {
              _campaign26Bright: '{colors.campaign26.happyCherry}',
              _campaign26Light: '{colors.campaign26.frozenYogurt}',
              _campaign26Dark: '{colors.campaign26.justChocolate}',
            },
          },
          campaign26Tag: {
            value: {
              _campaign26Bright: '{colors.campaign26.justChocolate}',
              _campaign26Light: '{colors.campaign26.justChocolate}',
              _campaign26Dark: '{colors.campaign26.happyCherry}',
            },
          },
          campaign26TagText: {
            value: {
              _campaign26Bright: '{colors.campaign26.frozenYogurt}',
              _campaign26Light: '{colors.campaign26.frozenYogurt}',
              _campaign26Dark: '{colors.campaign26.frozenYogurt}',
            },
          },
          campaign26Button: {
            value: {
              _campaign26Bright: '{colors.campaign26.justChocolate}',
              _campaign26Light: '{colors.campaign26.justChocolate}',
              _campaign26Dark: '{colors.campaign26.happyCherry}',
            },
          },
          campaign26RadioText: {
            value: {
              _campaign26Bright: 'white',
              _campaign26Light: '{colors.campaign26.happyCherry}',
              _campaign26Dark: '{colors.campaign26.frozenYogurt}',
            },
          },
          campaign26RadioTextChecked: {
            value: {
              _campaign26Bright: '{colors.campaign26.happyCherry}',
              _campaign26Light: 'white',
              _campaign26Dark: '{colors.campaign26.justChocolate}',
            },
          },
          campaign26RadioOutline: {
            value: {
              _campaign26Bright: 'rgba(255, 255, 255, 0.4)',
              _campaign26Light: 'rgba(240, 8, 76, 0.4)',
              _campaign26Dark: 'rgba(255, 255, 255, 0.4)',
            },
          },
          campaign26RadioChecked: {
            value: {
              _campaign26Bright: 'white',
              _campaign26Light: '{colors.campaign26.happyCherry}',
              _campaign26Dark: '{colors.campaign26.frozenYogurt}',
            },
          },
          campaign26ProgressBackground: {
            value: {
              _campaign26Bright: 'rgba(246, 107, 148, 1)',
              _campaign26Light: 'rgba(240, 8, 76, 0.2)',
              _campaign26Dark: 'rgba(254, 217, 225, 0.3)',
            },
          },
        },
      },
    },
  },
})
