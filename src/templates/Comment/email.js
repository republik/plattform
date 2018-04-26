import createCommentSchema from './schema'

import {
  BlockQuote,
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
