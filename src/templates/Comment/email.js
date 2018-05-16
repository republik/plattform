import createCommentSchema from './schema'

import {
  BlockCode,
  BlockQuote,
  BlockQuoteNested,
  BlockQuoteParagraph,
  Code,
  Container,
  Cursive,
  Definition,
  Emphasis,
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  StrikeThrough
} from '../../components/CommentBody/email'

const createSchema = ({ ...args } = {}) => {
  return createCommentSchema({
    BlockCode,
    BlockQuote,
    BlockQuoteNested,
    BlockQuoteParagraph,
    Code,
    Container,
    Cursive,
    Definition,
    Emphasis,
    Heading,
    Link,
    List,
    ListItem,
    Paragraph,
    StrikeThrough,
    ...args
  })
}

export default createSchema
