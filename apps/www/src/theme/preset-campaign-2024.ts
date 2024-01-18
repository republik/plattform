import { definePreset } from '@pandacss/dev'

export const presetCampaign2024 = definePreset({
  conditions: {
    extend: {
      campaign2024: '[data-page-theme="campaign-2024"] &',
      campaign2024Dark:
        '[data-theme="dark"] [data-page-theme="campaign-2024"] &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign2024: {
            yellow: { value: '#FFFDF0' },
            red: { value: '#F50000' },
          },
        },
      },
      semanticTokens: {
        colors: {
          pageBackground: {
            value: {
              _campaign2024: '{colors.campaign2024.yellow}',
              _campaign2024Dark: '{colors.campaign2024.red}',
            },
          },
          contrast: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
            },
          },
          text: {
            DEFAULT: {
              value: {
                _campaign2024: '{colors.campaign2024.red}',
                _campaign2024Dark: '{colors.campaign2024.yellow}',
              },
            },
          },
          teaserBackground: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Dark: '{colors.campaign2024.red}',
            },
          },
          link: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
            },
          },
          divider: {
            value: {
              _campaign2024: 'rgba(0,0,0,0.2)',
              _campaign2024Dark: 'rgba(255,255,255,0.4)',
            },
          },
        },
      },
    },
  },
})
