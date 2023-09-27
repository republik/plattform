import { definePreset } from '@pandacss/dev'

export const presetRepublik = definePreset({
  conditions: {
    extend: {
      light: '[data-theme="light"] &',
      dark: '[data-theme="dark"] &',
    },
  },

  // Useful for theme customization
  theme: {
    extend: {
      breakpoints: {
        sm: '375px',
        md: '768px',
        lg: '1025px',
      },
      tokens: {
        colors: {
          neutral: {
            '50': { value: '#fff' },
            '950': { value: '#222' },
          },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            DEFAULT: {
              value: {
                base: '{colors.neutral.950}',
                _dark: '{colors.neutral.50}',
              },
            },
            inverted: {
              value: {
                base: '{colors.neutral.50}',
                _dark: '{colors.neutral.950}',
              },
            },
            white: {
              value: '{colors.neutral.50}',
            },
          },
          contrast: {
            value: {
              base: 'black',
              _dark: 'white',
            },
          },
          background: {
            value: {
              base: 'white',
              _dark: 'black',
            },
          },
          link: {
            value: {
              base: 'hotpink',
              _dark: 'hotpink',
            },
          },
        },
        sizes: {
          header: {
            height: { value: { base: '48px', md: '60px' } },
            avatar: { value: { base: '26px', md: '36px' } },
          },
        },
        spacing: {
          header: {
            height: { value: '{sizes.header.height}' },
          },
        },
      },
      textStyles: {
        body: {
          description: 'Body text',
          value: {
            fontFamily:
              'GT-America-Standard-Regular, Helvetica-Neue-Regular, Arial-Regular, Roboto-Regular, sans-serif',
          },
        },
        headingLarge: {
          description: 'Large heading',
          value: {
            fontFamily: 'RepublikSerif-Black, Rubis-Bold, Georgia, serif',
            fontWeight: 900,
            fontStyle: 'normal',
            fontSize: '4em',
          },
        },
      },
    },
  },
})
