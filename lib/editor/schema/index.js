import {
  Document,
  H1,
  H2,
  H3,
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

export default {
  rules: [
    // Blocks
    Document,
    H1,
    H2,
    H3,
    P,
    Span,
    Label,
    Blockquote,

    // Marks
    Bold,
    Italic,
    Strikethrough,
    Underline
  ]
}
