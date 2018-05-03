import createCommentSchema from './schema'

import {
  BlockCode,
  BlockQuote,
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
