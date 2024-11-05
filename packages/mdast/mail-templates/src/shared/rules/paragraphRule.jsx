import { matchParagraph, matchType } from '@republik/mdast-react-render'
import {
  EditorialParagraph,
  InteractionParagraph,
} from '../components/Paragraph'
import { linkRule } from './linkRule'
import inlineRules from './inlineRules'

export const inlineInteractionParagraphRules = [
  ...inlineRules,
  linkRule,
  {
    matchMdast: matchType('strong'),
    component: ({ attributes, children }) => (
      <strong {...attributes}>{children}</strong>
    ),
  },
  {
    matchMdast: matchType('emphasis'),
    component: ({ attributes, children }) => (
      <em {...attributes}>{children}</em>
    ),
  },
]

// Sans-serif paragraph
export const interactionParagraphRule = {
  matchMdast: matchParagraph,
  component: InteractionParagraph,
  rules: inlineInteractionParagraphRules,
}

export const inlineEditorialParagraphRules = [
  ...inlineRules,
  linkRule,
  {
    matchMdast: matchType('strong'),
    component: ({ attributes, children }) => (
      <strong {...attributes}>{children}</strong>
    ),
  },
  {
    matchMdast: matchType('emphasis'),
    component: ({ attributes, children }) => (
      <em {...attributes}>{children}</em>
    ),
  },
]

// Serif paragraph
export const editorialParagraphRule = {
  matchMdast: matchParagraph,
  component: EditorialParagraph,
  rules: inlineEditorialParagraphRules,
}
