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
          overlay: {
            value: {
              _campaign2024: 'rgba(245,0,0, 0.05)',
              _campaign2024Dark: 'rgba(255,255,255, 0.05)',
            },
          },
          divider: {
            value: {
              _campaign2024: 'rgba(245,0,0, 0.15)',
              _campaign2024Dark: 'rgba(255,255,255, 0.15)',
            },
          },
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
        },
      },
      textStyles: {
        campaignHeading: {
          value: {
            fontFamily: 'druk',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '4xl',
            lineHeight: 1.16667,
          },
        },
      },
    },
  },
})
