import { definePreset } from '@pandacss/dev'

export const presetChallengeAccepted = definePreset({
  conditions: {
    extend: {
      challengeAccepted: '[data-page-theme="challenge-accepted"] &',
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
              _challengeAccepted: {
                base: '{colors.challengeAccepted.yellow}',
                _dark: '{colors.challengeAccepted.darkBlue}',
              },
            },
          },
          contrast: {
            value: {
              _challengeAccepted: {
                base: '{colors.challengeAccepted.blue}',
                _dark: '{colors.challengeAccepted.yellow}',
              },
            },
          },
          teaserBackground: {
            value: {
              _challengeAccepted: {
                base: '{colors.challengeAccepted.blue}',
                _dark: '{colors.challengeAccepted.blue}',
              },
            },
          },
          link: {
            value: {
              _challengeAccepted: {
                base: '{colors.challengeAccepted.blue}',
                _dark: '{colors.challengeAccepted.yellow}',
              },
            },
          },
        },
      },
    },
  },
})
