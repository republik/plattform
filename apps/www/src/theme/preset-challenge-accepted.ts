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
        },
      },
    },
    textStyles: {
      pageIntro: {
        value: {
          fontFamily: 'gtAmericaStandard',
          fontWeight: 'regular',
          fontStyle: 'normal',
          fontSize: 'clamp(1.5rem, 1rem + 2vw, 2.75rem)',
          lineHeight: 1.4,
          letterSpacing: -0.25,
          '& b, & strong': {
            fontWeight: 500,
          },
        },
      },
      eventTeaserTitle: {
        value: {
          fontFamily: 'druk',
          fontWeight: 'medium',
          fontStyle: 'normal',
          fontSize: 'clamp(4rem, 3rem + 15vw ,16rem)',
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
