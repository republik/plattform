import { defineRecipe } from '@pandacss/dev'

export const editorialContentRecipe = defineRecipe({
  className: 'editorial-content',
  description: 'Styles for editorial content (like articles)',

  base: {
    display: 'grid',
    rowGap: '4',
    gridTemplateColumns: `
    [full-start] minmax(token(spacing.4), 1fr)

      [breakout-start] minmax(0, token(spacing.40))

        [content-start] token(sizes.editorial) [content-end]

      minmax(0, token(spacing.40)) [breakout-end]

    minmax(token(spacing.4), 1fr) [full-end]
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
        },
      },
      meta: {},
    },
  },

  defaultVariants: {
    theme: 'editorial',
  },
})
