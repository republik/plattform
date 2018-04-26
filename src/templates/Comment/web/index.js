import createCommentSchema from '../schema'

import {
  CommentBodyBlockQuote,
  CommentBodyCode,
  CommentBodyHeading,
  CommentBodyList,
  CommentBodyListItem,
  CommentBodyParagraph
} from '../../../components/CommentBody/web'
import * as Editorial from '../../../components/Typography/Editorial'

const createSchema = ({ ...args } = {}) => {
  return createCommentSchema({
    BlockQuote: CommentBodyBlockQuote,
    Code: CommentBodyCode,
    Cursive: Editorial.Cursive,
    Emphasis: Editorial.Emphasis,
    Heading: CommentBodyHeading,
    Link: Editorial.A,
    List: CommentBodyList,
    ListItem: CommentBodyListItem,
    Paragraph: CommentBodyParagraph,
    StrikeThrough: Editorial.StrikeThrough,
    ...args
  })
}

export default createSchema
