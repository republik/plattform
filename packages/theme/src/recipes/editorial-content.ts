import { defineParts, defineRecipe } from '@pandacss/dev'

const contentParts = defineParts({
  root: { selector: '&' },
  allBlocks: { selector: '& > *' },
  allBlocksAfterHeadings: {
    selector: '& > :is(h2,h3,h4,h5,h6) + *',
  },
  breakoutBlocks: { selector: '& > .breakout' },
  breakoutLeftBlocks: { selector: '& > .breakout-left' },
  breakoutRightBlocks: { selector: '& > .breakout' },
  fullWidthBlocks: { selector: '& > .full' },
  paragraphs: { selector: '& > p' },
  subheadings: { selector: '& > h2' },
  unorderedLists: { selector: '& > ul' },
  orderedLists: { selector: '& > ol' },
  unorderedListItems: { selector: '& > ul li' },
  orderedListItems: { selector: '& > ol li' },
})

export const editorialContentRecipe = defineRecipe({
  className: 'editorial-content',
  description: 'Styles for editorial content (like articles)',

  base: contentParts({
    root: {
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
    },
    allBlocks: {
      gridColumn: 'content',
      mt: '8',
      _first: { mt: '0' },
    },
    allBlocksAfterHeadings: {
      mt: '2',
      md: {
        mt: '3',
      },
    },
    breakoutBlocks: {
      gridColumn: 'breakout',
    },
    breakoutLeftBlocks: {
      gridColumn: 'breakout / content',
    },
    breakoutRightBlocks: {
      gridColumn: 'content / breakout',
    },
    fullWidthBlocks: {
      gridColumn: 'full',
    },

    unorderedLists: {
      pl: '0',
      listStyle: 'none',
    },
    orderedLists: {
      listStyleType: 'decimal',
      pl: '10',
    },
    unorderedListItems: {
      pl: '6',
      position: 'relative',
      _before: {
        content: '"–"',
        position: 'absolute',
        left: 0,
      },
    },
    orderedListItems: {
      pl: '2',
      _before: { display: 'none' },
    },
  }),

  variants: {
    theme: {
      editorial: contentParts({
        paragraphs: { textStyle: 'editorialParagraph' },
        subheadings: { textStyle: 'editorialH2' },
        unorderedListItems: {
          textStyle: 'editorialParagraph',
        },
        orderedListItems: {
          textStyle: 'editorialParagraph',
        },
      }),
      meta: {
        // TODO
      },
    },
  },

  defaultVariants: {
    theme: 'editorial',
  },
})
