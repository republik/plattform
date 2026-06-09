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
          mt: '8',
          mb: '2',
          md: {
            mt: '16',
            mb: '3',
          },
        },
      },
      meta: {},
    },
  },

  defaultVariants: {
    theme: 'editorial',
  },
})
