import { definePreset } from '@pandacss/dev'

export const presetCampaign2024 = definePreset({
  conditions: {
    extend: {
      campaign2024: '[data-page-theme="campaign-2024"] &',
      campaign2024Inverted:
        '[data-page-theme="campaign-2024"]:where([data-theme-inverted]) &',
      campaign2024Dark:
        '[data-theme="dark"] [data-page-theme="campaign-2024"] &',
      campaign2024DarkInverted:
        '[data-theme="dark"] [data-page-theme="campaign-2024"]:where([data-theme-inverted]) &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign2024: {
            yellow: { value: '#FFFDF0' },
            yellowLight: { value: '#FFFDF080' },
            red: { value: 'rgb(229,1,70)' },
            darkRed: { value: '#610000' },
          },
        },
      },
      semanticTokens: {
        gradients: {
          stickyBottomPanelBackground: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Inverted:
                'linear-gradient(180deg, transparent 0%, {colors.campaign2024.red} 4rem, {colors.campaign2024.red} 100%)',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
              _campaign2024DarkInverted:
                'linear-gradient(180deg, transparent 0%, {colors.campaign2024.darkRed} 4rem, {colors.campaign2024.darkRed} 100%)',
            },
          },
        },
        colors: {
          primary: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Inverted: '{colors.campaign2024.yellow}',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
            },
          },
          overlay: {
            value: {
              _campaign2024: 'rgba(229,1,70, 0.05)',
              _campaign2024Inverted: 'rgba(255,255,255, 0.5)',
              _campaign2024Dark: 'rgba(255,255,255, 0.05)',
            },
          },
          divider: {
            value: {
              _campaign2024: 'rgba(229,1,70,0.15)',
              _campaign2024Dark: 'rgba(255,255,255, 0.15)',
            },
          },
          pageBackground: {
            value: {
              _campaign2024: '{colors.campaign2024.yellow}',
              _campaign2024Inverted: '{colors.campaign2024.red}',
              _campaign2024Dark: '{colors.campaign2024.darkRed}',
            },
          },
          contrast: {
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Inverted: '{colors.campaign2024.yellow}',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
            },
          },
          text: {
            DEFAULT: {
              value: {
                _campaign2024: '{colors.campaign2024.red}',
                _campaign2024Inverted: '{colors.campaign2024.yellow}',
                _campaign2024Dark: '{colors.campaign2024.yellow}',
              },
            },
            inverted: {
              value: {
                _campaign2024: '{colors.campaign2024.yellow}',
                _campaign2024Inverted: '{colors.campaign2024.red}',
                _campaign2024Dark: '{colors.campaign2024.red}',
                _campaign2024DarkInverted: '{colors.campaign2024.darkRed}',
              },
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
