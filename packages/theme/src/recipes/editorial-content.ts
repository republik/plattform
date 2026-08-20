import { defineParts, defineRecipe } from '@pandacss/dev'
import { editorialFontSizes, readerScaledFontSize } from '../typography'

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
  smallheadings: { selector: '& > :is(h3,h4,h5,h6)' },
  heading: { selector: '& .page-heading' },
  title: { selector: '& .page-title' },
  titleAfterHeading: { selector: '& .page-heading + .page-title' },
  lead: { selector: '& .page-lead' },
  byline: { selector: '& .page-byline' },
  unorderedLists: { selector: '& > ul' },
  orderedLists: { selector: '& > ol' },
  unorderedListItems: { selector: '& > ul li' },
  orderedListItems: { selector: '& > ol li' },
})

/**
 * An editorial text style whose size follows the reader's font size setting.
 * Size and text style come from the same key, so the two can't drift — see
 * `editorialFontSizes`, which the preset's `textStyles` use as well.
 */
const readerScaledText = (textStyle: keyof typeof editorialFontSizes) => ({
  textStyle,
  ...readerScaledFontSize(editorialFontSizes[textStyle]),
})

export const editorialContentRecipe = defineRecipe({
  className: 'editorial-content',
  description: 'Styles for editorial content (like articles)',

  base: contentParts({
    root: {
      // Confines the reader's font size setting to editorial content — see
      // `READER_FONT_SCALE`.
      '--article-font-scale': 'var(--reader-font-scale, 1)',
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
        lead: readerScaledText('editorialLead'),
        byline: { textStyle: 'editorialByline' },
        paragraphs: readerScaledText('editorialParagraph'),
        subheadings: readerScaledText('editorialSubheading'),
        smallheadings: {
          ...readerScaledText('editorialParagraph'),fontWeight:"bold"
        },
        unorderedListItems: readerScaledText('editorialParagraph'),
        orderedListItems: readerScaledText('editorialParagraph'),
      }),
      META: contentParts({
        heading: { textStyle: 'editorialHeading' },
        title: { textStyle: 'metaTitle' },
        lead: readerScaledText('editorialLead'),
        byline: { textStyle: 'editorialByline' },
        paragraphs: readerScaledText('editorialParagraph'),
        subheadings: readerScaledText('editorialSubheading'),
        smallheadings: {
          ...readerScaledText('editorialParagraph'),fontWeight:"bold"},
        unorderedListItems: readerScaledText('editorialParagraph'),
        orderedListItems: readerScaledText('editorialParagraph'),
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
          ...readerScaledText('editorialLead'),
          textAlign: 'center',
          gridColumn: 'breakout',
        },
        paragraphs: readerScaledText('metaParagraph'),
        subheadings: readerScaledText('metaSubheading'),
        smallheadings: {...readerScaledText('metaSubheading'),fontWeight:"medium"},
        unorderedListItems: readerScaledText('metaParagraph'),
        orderedListItems: readerScaledText('metaParagraph'),
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
