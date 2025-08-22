import { definePreset } from '@pandacss/dev'

export const presetCampaign2025 = definePreset({
  name: 'campaign-2025',
  conditions: {
    extend: {
      campaign2025: '[data-page-theme="campaign-2025"] &',
      campaign2025Inverted:
        '[data-page-theme="campaign-2025"]:where([data-theme-inverted]) &',
      // campaign2025Dark:
      //   '[data-theme="dark"] [data-page-theme="campaign-2025"] &',
      // campaign2025DarkInverted:
      //   '[data-theme="dark"] [data-page-theme="campaign-2025"]:where([data-theme-inverted]) &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          campaign2025: {
            beige: { value: '#F2ECE6' },
            charcoal: { value: '#313131' },
            white: { value: '#ffffff' },
            red: { value: '#FF6969' },
            darkRed: { value: '#3B0012' },
          },
        },
      },
      semanticTokens: {
        gradients: {
          stickyBottomPanelBackground: {
            value: {
              _campaign2025: '{colors.campaign2025.red}',
            },
          },
        },
        colors: {
          primary: {
            value: {
              _campaign2025: '#191919',
            },
          },
          overlay: {
            value: {
              _campaign2025: 'rgba(255,255,255,0.05)',
              _campaign2025Inverted: 'rgba(0,0,0,0.05)',
            },
          },
          divider: {
            value: {
              _campaign2025: 'rgba(255,255,255,0.15)',
              _campaign2025Inverted: 'rgba(0,0,0,0.15)',
            },
          },
          pageBackground: {
            value: {
              _campaign2025: '{colors.campaign2025.charcoal}',
              _campaign2025Inverted: '{colors.campaign2025.beige}',
            },
          },
          contrast: {
            value: {
              _campaign2025: '{colors.campaign2025.red}',
            },
          },
          text: {
            DEFAULT: {
              value: {
                _campaign2025: '{colors.campaign2025.white}',
                _campaign2025Inverted: '{colors.neutral.950}',
              },
            },
            inverted: {
              value: {
                _campaign2025: '#ffffff',
              },
            },
            primary: {
              value: {
                _campaign2025: '#ffffff',
              },
            },
          },
          link: {
            value: {
              _campaign2025: '#FF6969',
            },
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
