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
          white: { value: '#fff' },
        },
        sizes: {
          full: { value: '100%' },
          viewportWidth: { value: '100vw' },
          24: { value: '6rem' },
        },
        spacing: {
          0: { value: '0rem' },
          px: { value: '1px' },
          0.5: { value: '0.125rem' },
          1: { value: '0.25rem' },
          1.5: { value: '0.375rem' },
          2: { value: '0.5rem' },
          3: { value: '0.75rem' },
          4: { value: '1rem' },
          5: { value: '1.25rem' },
          6: { value: '1.5rem' },
          8: { value: '2rem' },
          12: { value: '3rem' },
          16: { value: '4rem' },
          32: { value: '8rem' },
        },
        radii: {
          full: { value: '9999px' },
        },
        fonts: {
          republikSerif: {
            value: 'RepublikSerif, Georgia, serif',
          },
          rubis: {
            value: 'Rubis, Georgia, Droid-Serif, serif',
          },
          gtAmericaStandard: {
            value:
              'GT-America-Standard, Helvetica-Neue, Arial, Roboto, sans-serif',
          },
          inicia: {
            value: 'Inicia-Medium, Helvetica-Neue, Arial, Roboto, sans-serif',
          },
        },
        fontWeights: {
          regular: { value: '400' },
          medium: { value: '500' },
          bold: { value: '700' },
          black: { value: '900' },
        },
        fontSizes: {
          xs: { value: '0.75rem' },
          s: { value: '0.875rem' },
          base: { value: '1rem' },
          l: { value: '1.125rem' },
          xl: { value: '1.25rem' },
          '2xl': { value: '1.5rem' },
          '3xl': { value: '2rem' },
          '4xl': { value: '4rem' },
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
          pageBackground: {
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
          overlay: { value: 'rgba(0,0,0,0.1)' },
        },
        sizes: {
          maxContentWidth: { value: '48rem' },
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
        fontSizes: {
          'l-xl': {
            value: {
              base: '{fontSizes.l}',
              md: '{fontSizes.xl}',
            },
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
        title: {
          value: {
            fontFamily: 'republikSerif',
            fontWeight: 'black',
            fontStyle: 'normal',
            fontSize: '4em',
          },
        },
        teaserTitle: {
          value: {
            fontFamily: 'republikSerif',
            fontWeight: 'black',
            fontStyle: 'normal',
            fontSize: { base: '3xl', md: '3rem' },
            lineHeight: 1.125,
          },
        },
        teaserLead: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 'xl',
            lineHeight: 1.375,
          },
        },
        sans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 'responsiveText',
            lineHeight: 1.5,
          },
        },
        serif: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 'responsiveText',
            lineHeight: 1.5,
          },
        },
        h1Sans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'medium',
            fontStyle: 'normal',
            fontSize: '3xl',
            lineHeight: 1.16667,
          },
        },
        h2Sans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'medium',
            fontStyle: 'normal',
            fontSize: '2xl',
            lineHeight: 1.16667,
          },
        },
        h3Sans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'medium',
            fontStyle: 'normal',
            fontSize: 'xl',
            lineHeight: 1.16667,
          },
        },
        h1Serif: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: '3xl',
            lineHeight: 1.16667,
          },
        },
        h2Serif: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: '2xl',
            lineHeight: 1.16667,
          },
        },
        h3Serif: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 'xl',
            lineHeight: 1.16667,
          },
        },
        // LEGACY
        serifTitle: {
          value: {
            fontFamily: 'republikSerif',
            fontWeight: 900,
            fontStyle: 'normal',
          },
        },
        serifRegular: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 400,
            fontStyle: 'normal',
          },
        },
        serifItalic: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 400,
            fontStyle: 'italic',
          },
        },
        serifBold: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 700,
            fontStyle: 'normal',
          },
        },
        serifBoldItalic: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 700,
            fontStyle: 'italic',
          },
        },
        sansSerifRegular: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 400,
            fontStyle: 'normal',
          },
        },
        sansSerifItalic: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 400,
            fontStyle: 'italic',
          },
        },
        sansSerifMedium: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 500,
            fontStyle: 'normal',
          },
        },
        sansSerifBold: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 700,
            fontStyle: 'normal',
          },
        },
        monospaceRegular: {
          value: {
            fontFamily: 'Menlo, Courier, monospace',
            fontWeight: 400,
            fontStyle: 'normal',
          },
        },
        cursiveTitle: {
          value: {
            fontFamily: 'inicia',
            fontWeight: 500,
            fontStyle: 'italic',
          },
        },
        flyerTitle: {
          value: {
            fontFamily: 'Druk-Wide, Roboto, sans-serif',
            fontWeight: 500,
            fontStyle: 'normal',
          },
        },
      },
    },
  },
})