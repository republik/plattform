import createCommentSchema from './schema'

import {
  CommentBodyBlockCode,
  CommentBodyBlockQuote,
  CommentBodyBlockQuoteNested,
  CommentBodyBlockQuoteParagraph,
  CommentBodyCode,
  CommentBodyContainer,
  CommentBodyDefinition,
  CommentBodyHeading,
  CommentBodyList,
  CommentBodyListItem,
  CommentBodyParagraph,
} from '@project-r/styleguide/src/components/CommentBody/web'
import { Editorial } from '@project-r/styleguide/src/components/Typography'

const createCommentWebSchema = ({ ...args } = {}) => {
  return createCommentSchema({
    BlockCode: CommentBodyBlockCode,
    BlockQuote: CommentBodyBlockQuote,
    BlockQuoteNested: CommentBodyBlockQuoteNested,
    BlockQuoteParagraph: CommentBodyBlockQuoteParagraph,
    Code: CommentBodyCode,
    Container: CommentBodyContainer,
    Definition: CommentBodyDefinition,
    Heading: CommentBodyHeading,
    Link: Editorial.A,
    List: CommentBodyList,
    ListItem: CommentBodyListItem,
    Paragraph: CommentBodyParagraph,
    StrikeThrough: Editorial.StrikeThrough,
    ...args,
  })
}

export default createCommentWebSchema
