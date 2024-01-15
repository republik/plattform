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
            value: {
              _campaign2024: '{colors.campaign2024.red}',
              _campaign2024Dark: '{colors.campaign2024.yellow}',
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
    textStyles: {
      pageIntro: {
        value: {
          fontFamily: 'gtAmericaStandard',
          fontWeight: 'regular',
          fontStyle: 'normal',
          fontSize: { base: '2xl', md: '3xl' },
          lineHeight: 1.4,
          '& b, & strong': {
            fontWeight: 700,
          },
        },
      },
      paragraph: {
        value: {
          fontFamily: 'gtAmericaStandard',
          fontWeight: 'regular',
          fontStyle: 'normal',
          fontSize: { base: 'xl', md: '2xl' },
          lineHeight: 1.4,
          '& b, & strong': {
            fontWeight: 700,
          },
        },
      },
      eventTeaserTitle: {
        value: {
          fontFamily: 'druk',
          fontWeight: 'medium',
          fontStyle: 'normal',
          // Fluid font size https://utopia.fyi/clamp/calculator?a=320,832,90—270
          fontSize: 'clamp(5.625rem, -1.4062rem + 35.1563vw, 16.875rem)',
        },
      },
      newsletterTeaserTitle: {
        value: {
          fontFamily: 'druk',
          fontWeight: 'medium',
          fontStyle: 'normal',
          fontSize: { base: '3xl', md: '4xl' },
          lineHeight: 1.16667,
        },
      },
      personTitle: {
        value: {
          fontFamily: 'druk',
          fontWeight: 'medium',
          fontStyle: 'italic',
          fontSize: 100,
          textTransform: 'uppercase',
        },
      },
    },
  },
})
