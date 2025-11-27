import { definePreset } from '@pandacss/dev'
import { buttonRecipe } from '../src/recipes/button'

export const presetRepublik = definePreset({
  name: 'republik',
  conditions: {
    extend: {
      light: '[data-theme="light"] &',
      dark: '[data-theme="dark"] &',
      stateOpen: '&[data-state="open"]',
      stateClosed: '&[data-state="closed"]',
    },
  },
  globalCss: {
    html: {
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
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
            '50': { value: '#ffffff' },
            '950': { value: '#020202' },
          },
          white: { value: '#fff' },
          transparent: { value: 'transparent' },
          current: { value: 'currentColor' },
        },
        shadows: {
          sm: { value: '0 0 6px 0 rgba(0, 0, 0, 0.35)' },
        },
        sizes: {
          full: { value: '100%' },
          viewportWidth: { value: '100vw' },
          24: { value: '6rem' },
          narrow: { value: '30rem' },
          center: { value: '695px' },
          shop: { value: '866px' },
        },
        spacing: {
          0: { value: '0rem' },
          px: { value: '1px' },
          0.5: { value: '0.125rem' },
          1: { value: '0.25rem' },
          1.5: { value: '0.375rem' },
          2: { value: '0.5rem' },
          2.5: { value: '0.625rem' },
          3: { value: '0.75rem' },
          3.5: { value: '0.9375rem' },
          4: { value: '1rem' },
          5: { value: '1.25rem' },
          6: { value: '1.5rem' },
          8: { value: '2rem' },
          10: { value: '2.5rem' },
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
          druk: {
            value: 'Druk, Helvetica-Neue, Arial, Roboto, sans-serif',
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
          '4xl': { value: '3rem' },
          '8xl': { value: '6rem' },
          '16xl': { value: '12rem' },
        },
        lineHeights: {
          1: { value: 1 },
        },
        animations: {
          spin: { value: 'spin 1s linear infinite' },
          slideUp: { value: 'slideUp 300ms ease-in-out' },
          slideDown: { value: 'slideDown 300ms ease-in-out' },
          fadeIn: { value: 'fadeIn 300ms ease-in-out' },
          fadeOut: { value: 'fadeOut 300ms ease-in-out' },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            DEFAULT: {
              value: {
                base: '{colors.neutral.950}',
                _light: '{colors.neutral.950}',
                _dark: '{colors.neutral.50}',
              },
            },
            inverted: {
              value: {
                base: '{colors.neutral.50}',
                _light: '{colors.neutral.50}',
                _dark: '{colors.neutral.950}',
              },
            },
            white: {
              value: '{colors.neutral.50}',
            },
            black: {
              value: '{colors.neutral.950}',
            },
            marketingAccent: {
              value: '#FF6969',
            },
          },
          contrast: {
            value: {
              base: 'black',
              _light: 'black',
              _dark: 'white',
            },
          },
          background: {
            DEFAULT: {
              value: {
                base: 'white',
                _light: 'white',
                _dark: '#191919',
              },
            },
            marketing: {
              value: '#F2ECE6',
            },
            marketingAlt: {
              value: '#E2FBA6',
            },
            marketingAccent: {
              value: '#FF9A82',
            },
            marketingAccentAlt: {
              value: '#FFA4DD',
            },
          },
          pageBackground: {
            value: {
              base: 'white',
              _light: 'white',
              _dark: '#191919',
            },
          },
          link: {
            value: {
              base: '#00AA00',
              _light: '#00AA00',
              _dark: '#00AA00',
            },
          },
          primary: {
            value: {
              base: '#00AA00',
              _light: '#00AA00',
              _dark: '#00AA00',
            },
          },
          primaryHover: {
            value: {
              base: '#008800',
              _light: '#008800',
              _dark: '#008800',
            },
          },
          overlay: {
            value: {
              base: 'rgba(0,0,0,0.2)',
              _light: 'rgba(0,0,0,0.2)',
              _dark: 'rgba(0,0,0,0.4)',
            },
          },
          error: {
            value: { base: '#dc2626', _light: '#dc2626', _dark: '#dc2626' },
          },
          divider: {
            value: {
              base: '#DBDCDD',
              _light: '#DBDCDD',
              _dark: '#4C4C4C',
            },
          },
          disabled: {
            value: {
              base: '#B8BDC1',
              _light: '#B8BDC1',
              _dark: '#949494',
            },
          },
          textSoft: {
            value: {
              base: '#757575',
              _light: '#757575',
              _dark: '#A9A9A9',
            },
          },
        },
        sizes: {
          maxContentWidth: { value: '52rem' },
          content: {
            text: { value: '42rem' },
            narrow: { value: '27rem' },
          },
          header: {
            height: { value: { base: '48px', md: '60px' } },
            avatar: { value: { base: '26px', md: '32px' } },
            logoHeight: { value: { base: '23px', md: '28px' } },
          },
        },

        lineHeights: {
          pageNav: { value: '2.5rem' },
        },
        spacing: {
          '4-6': { value: { base: '1rem', md: '1.5rem' } },
          '4-8': { value: { base: '1rem', md: '2rem' } },
          '8-16': { value: { base: '2rem', md: '4rem' } },
          '16-32': { value: { base: '4rem', md: '8rem' } },
          '32-64': { value: { base: '8rem', md: '16rem' } },
          header: {
            height: { value: '{sizes.header.height}' },
            avatarMargin: { value: '0.6875rem  1rem' },
            logoMargin: { value: { base: '12px 0', md: '15px 0' } },
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
            fontFamily: 'gtAmericaStandard',
          },
        },
        airy: {
          description: 'Airy body text',
          value: {
            fontFamily: 'gtAmericaStandard',
            fontSize: 'l',
            lineHeight: 1.4,
            '& b': {
              fontWeight: 500,
            },
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
            fontSize: { base: 'l', md: 'xl' },
            lineHeight: 1.375,
          },
        },
        teaserLeadSans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: { base: 'l', md: 'xl' },
            lineHeight: 1.375,
          },
        },
        teaserCredits: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 's',
            lineHeight: 1.375,
          },
        },
        sans: {
          value: {
            fontFamily: 'gtAmericaStandard',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 'base',
            lineHeight: 1.5,
          },
        },
        serif: {
          value: {
            fontFamily: 'rubis',
            fontWeight: 'regular',
            fontStyle: 'normal',
            fontSize: 'base',
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
      },
    },

    recipes: {
      button: buttonRecipe,
    },

    keyframes: {
      radixCollapsibleSlideDown: {
        from: { height: 0 },
        to: { height: 'var(--radix-collapsible-content-height)' },
      },
      radixCollapsibleSlideUp: {
        from: { height: 'var(--radix-collapsible-content-height)' },
        to: { height: 0 },
      },
      progressGrow: {
        from: { width: 0 },
        to: { width: 'var(--progress-width)' },
      },
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideUp: {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0%)' },
      },
      slideDown: {
        from: { transform: 'translateY(0%)' },
        to: { transform: 'translateY(100%)' },
      },
    },
  },
})
