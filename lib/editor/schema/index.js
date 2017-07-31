import {
  H1,
  H2,
  H3,
  Lead,
  P,
  Label,
  Blockquote,
  Image,
  ImageCaption,
  ImageSource
} from './blocks'

import ImageWithCaption from './blocks/ImageWithCaption'

import { A, Span } from './inlines'

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
    Label,
    Blockquote,
    ImageWithCaption,
    Image,
    ImageCaption,
    ImageSource,

    // Inlines
    Span,
    A,

    // Marks
    Bold,
    Italic,
    Strikethrough,
    Underline
  ]
}
