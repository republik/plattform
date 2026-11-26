import { defineParts, defineRecipe } from '@pandacss/dev'

const contentParts = defineParts({
  root: { selector: '&' },
  paragraphs: { selector: '& > p' },
  subheadings: { selector: '& > h2:not(.infobox-title)' },
  unorderedLists: { selector: '& > ul' },
  orderedLists: { selector: '& > ol' },
  unorderedListItems: { selector: '& > ul li' },
  orderedListItems: { selector: '& > ol li' },
})

const infoboxText = {
  textStyle: 'sans',
  lineHeight: '1.5',
  fontSize: { base: 'base', md: 'l' },
}

export const infoboxContentRecipe = defineRecipe({
  className: 'infobox-content',
  description: 'Styles for infobox',

  base: contentParts({
    paragraphs: {
      ...infoboxText,
      ml: '0',
      mr: '0',
      mb: '4',
    },
    subheadings: {
      ...infoboxText,
      fontWeight: 500,
      mt: '6',
      mb: '4',
      fontSize: { base: 'base', md: 'l' },
    },
    unorderedLists: {
      pl: '0',
      listStyle: 'none',
      mb: '4',
    },
    orderedLists: {
      listStyleType: 'decimal',
      pl: '10',
      mb: '4',
    },
    unorderedListItems: {
      ...infoboxText,
      pl: '6',
      position: 'relative',
      _before: {
        content: '"–"',
        position: 'absolute',
        left: 0,
      },
    },
    orderedListItems: {
      ...infoboxText,
      pl: '2',
      _before: { display: 'none' },
    },
  }),
})
