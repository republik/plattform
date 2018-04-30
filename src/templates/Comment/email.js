import createCommentSchema from './schema'

import {
  BlockQuote,
  BlockQuoteParagraph,
  Code,
  Container,
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
    Container,
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
