import createCommentSchema from './schema'

import {
  BlockQuote,
  BlockQuoteParagraph,
  Code,
  Cursive,
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
    BlockQuote,
    BlockQuoteParagraph,
    Code,
    Cursive,
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
