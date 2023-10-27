import { definePreset } from '@pandacss/dev'

export const presetChallengeAccepted = definePreset({
  conditions: {
    extend: {
      challengeAccepted: '[data-page-theme="challenge-accepted"] &',
      challengeAcceptedDark:
        '[data-theme="dark"] [data-page-theme="challenge-accepted"] &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          challengeAccepted: {
            yellow: { value: '#EBEA2B' },
            blue: { value: '#4033D3' },
            darkBlue: { value: '#1B1469' },
            white: { value: '#ffffff' },
          },
        },
      },
      semanticTokens: {
        colors: {
          pageBackground: {
            value: {
              _challengeAccepted: '{colors.challengeAccepted.yellow}',
              _challengeAcceptedDark: '{colors.challengeAccepted.darkBlue}',
            },
          },
          contrast: {
            value: {
              _challengeAccepted: '{colors.challengeAccepted.blue}',
              _challengeAcceptedDark: '{colors.challengeAccepted.yellow}',
            },
          },
          teaserBackground: {
            value: {
              _challengeAccepted: '{colors.challengeAccepted.blue}',
              _challengeAcceptedDark: '{colors.challengeAccepted.blue}',
            },
          },
          link: {
            value: {
              _challengeAccepted: '{colors.challengeAccepted.blue}',
              _challengeAcceptedDark: '{colors.challengeAccepted.yellow}',
            },
          },
          divider: {
            value: {
              _challengeAccepted: 'rgba(0,0,0,0.2)',
              _challengeAcceptedDark: 'rgba(255,255,255,0.4)',
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
          // Fluid font size https://utopia.fyi/clamp/calculator?a=320,832,24—44
          fontSize: 'clamp(1.5rem, 0.7188rem + 3.9063vw, 2.75rem)',
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
          // Fluid font size https://utopia.fyi/clamp/calculator?a=320,832,90—270
          fontSize: 'clamp(2.25rem, 1.7813rem + 2.3438vw, 3rem)',
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
