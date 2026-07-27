import { defineParts, defineRecipe } from '@pandacss/dev'

const contentParts = defineParts({
  root: { selector: '&' },
  allBlocks: { selector: '& > *, .regwall > *' },
  allBlocksAfterHeadings: {
    selector: '& > :is(h2,h3,h4,h5,h6) + *, .regwall > :is(h2,h3,h4,h5,h6) + *',
  },
  breakoutBlocks: { selector: '& > .breakout, .regwall > .breakout' },
  breakoutLeftBlocks: {
    selector: '& > .breakout-left, .regwall > .breakout-left',
  },
  breakoutRightBlocks: {
    selector: '& > .breakout-right, .regwall > .breakout-right',
  },
  fullWidthBlocks: { selector: '& > .full, .regwall > .full' },
  paragraphs: { selector: '& > p, .regwall > p' },
  subheadings: { selector: '& > h2, .regwall > h2' },
  heading: { selector: '& .page-heading, .regwall .page-heading' },
  title: { selector: '& .page-title, .regwall .page-title' },
  titleAfterHeading: {
    selector:
      '& .page-heading + .page-title, .regwall .page-heading + .page-title',
  },
  lead: { selector: '& .page-lead, .regwall .page-lead' },
  byline: { selector: '& .page-byline, .regwall .page-byline' },
  unorderedLists: { selector: '& > ul, .regwall > ul' },
  orderedLists: { selector: '& > ol, .regwall > ol' },
  unorderedListItems: { selector: '& > ul li, .regwall > ul li' },
  orderedListItems: { selector: '& > ol li, .regwall > ol li' },
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
    heading: {
      color: 'var(--page-theme-accent-color)',
      _first: {
        mt: '12',
      },
    },
    title: {
      mt: '12',
    },
    titleAfterHeading: {
      mt: '8',
    },
    lead: {
      mt: '4',
    },
    byline: {
      mt: '4',
    },
  }),

  variants: {
    theme: {
      EDITORIAL: contentParts({
        heading: { textStyle: 'editorialHeading' },
        title: { textStyle: 'editorialTitle' },
        lead: { textStyle: 'editorialLead' },
        byline: { textStyle: 'editorialByline' },
        paragraphs: { textStyle: 'editorialParagraph' },
        subheadings: { textStyle: 'editorialSubheading' },
        unorderedListItems: {
          textStyle: 'editorialParagraph',
        },
        orderedListItems: {
          textStyle: 'editorialParagraph',
        },
      }),
      META: contentParts({
        heading: { textStyle: 'editorialHeading' },
        title: { textStyle: 'metaTitle' },
        lead: { textStyle: 'editorialLead' },
        byline: { textStyle: 'editorialByline' },
        paragraphs: { textStyle: 'editorialParagraph' },
        subheadings: { textStyle: 'editorialSubheading' },
        unorderedListItems: {
          textStyle: 'editorialParagraph',
        },
        orderedListItems: {
          textStyle: 'editorialParagraph',
        },
      }),
      PAGE: contentParts({
        heading: {
          textStyle: 'editorialHeading',
          textAlign: 'center',
          gridColumn: 'breakout',
        },
        title: {
          textStyle: 'metaTitle',
          textAlign: 'center',
          gridColumn: 'breakout',
        },
        lead: {
          textStyle: 'editorialLead',
          textAlign: 'center',
          gridColumn: 'breakout',
        },
        paragraphs: { textStyle: 'metaParagraph' },
        subheadings: { textStyle: 'metaSubheading' },
        unorderedListItems: {
          textStyle: 'metaParagraph',
        },
        orderedListItems: {
          textStyle: 'metaParagraph',
        },
      }),
    },
  },

  defaultVariants: {
    theme: 'EDITORIAL',
  },

  // The variant is chosen at runtime (from Sanity theme.name), so Panda's
  // static extractor can't see which ones are used — generate them all.
  staticCss: [{ theme: ['*'] }],
})
