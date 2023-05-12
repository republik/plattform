import createCommentSchema from './schema'

import {
  BlockCode,
  BlockQuote,
  BlockQuoteNested,
  BlockQuoteParagraph,
  Code,
  Container,
  Definition,
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  StrikeThrough,
} from '@project-r/styleguide/src/components/CommentBody/email'

const createCommentEmailSchema = ({ ...args } = {}) => {
  return createCommentSchema({
    BlockCode,
    BlockQuote,
    BlockQuoteNested,
    BlockQuoteParagraph,
    Code,
    Container,
    Definition,
    Heading,
    Link,
    List,
    ListItem,
    Paragraph,
    StrikeThrough,
    ...args,
  })
}

export default createCommentEmailSchema
