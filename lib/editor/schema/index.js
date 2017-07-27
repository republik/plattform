import {
  H1,
  H2,
  H3,
  Lead,
  P,
  Span,
  Label,
  Blockquote
} from './blocks'

import {
  Bold,
  Italic,
  Strikethrough,
  Underline
} from './marks'

import {
  AlwaysTitleFirst,
  OnlyOneTitle,
  OnlyOneLead
} from './rules'

export default {
  rules: [
    // Rules
    AlwaysTitleFirst,
    OnlyOneTitle,
    OnlyOneLead,

    // Blocks
    H1,
    H2,
    H3,
    Lead,
    P,
    Span,
    Label,
    Blockquote,

    // Marks
    Bold,
    Italic,
    Strikethrough,
    Underline

    // Rules
    // OnlyOneTitle,
    // AtLeastOneParagraph,
  ]
}
