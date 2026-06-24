import { defineRecipe } from '@pandacss/dev'

export const editorialContentRecipe = defineRecipe({
  className: 'editorial-content',
  description: 'Styles for editorial content (like articles)',

  base: {
    display: 'grid',
    gridTemplateColumns: `
    [full-start]
      minmax(token(spacing.4), 1fr)
      [breakout-start]
        minmax(0, token(spacing.40))
        [content-start]
          min(token(sizes.editorial), calc(100% - token(spacing.8)))
        [content-end]
        minmax(0, token(spacing.40))
      [breakout-end]
      minmax(token(spacing.4), 1fr)
    [full-end]
    `,

    '& > *': {
      gridColumn: 'content',
    },
    '& > .breakout': {
      gridColumn: 'breakout',
    },
    '& > .breakout-left': {
      gridColumn: 'breakout / content',
    },
    '& > .breakout-right': {
      gridColumn: 'content / breakout',
    },
    '& > .full': {
      gridColumn: 'full',
    },
  },

  variants: {
    theme: {
      editorial: {
        '& > p': {
          textStyle: 'editorialParagraph',
          mb: '8',
        },

        '& > h2': {
          textStyle: 'editorialH2',
          mb: '2',
          md: {
            mt: '8',
            mb: '3',
          },
          '& + p': { mt: 0 },
          _first: {
            mt: 0,
          },
          _last: {
            mb: 0,
          },
        },

        '& > hr': {
          mb: '8',
        },

        '& :where(ul)': {
          mb: '8',
          pl: '0',
          listStyle: 'none',
        },

        '& :where(ol)': {
          mb: '8',
          pl: '[1.7em]',
          '& > li': {
            pl: '2',
          },
        },

        '& :where(li)': {
          textStyle: 'editorialParagraph',
          pl: '6',
          position: 'relative',
          mb: '4',
          _lastOfType: { mb: '0' },
          _before: {
            content: '"–"',
            position: 'absolute',
            left: 0,
          },
          '& p': {},
        },
      },
      meta: {
        // TODO
      },
    },
  },

  defaultVariants: {
    theme: 'editorial',
  },
})
