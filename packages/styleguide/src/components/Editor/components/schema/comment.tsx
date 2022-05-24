import React from 'react'
import { SchemaConfig } from '../../custom-types'
import {
  CommentBodyBlockQuote,
  CommentBodyBlockQuoteParagraph,
  CommentBodyHeading,
  CommentBodyParagraph,
} from '../../../CommentBody/web'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../../CommentBody/web/List'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup } from '../../../Typography'

export const commentSchema: SchemaConfig = {
  blockQuote: CommentBodyBlockQuote,
  blockQuoteText: CommentBodyBlockQuoteParagraph,
  list: List,
  listItem: ListItem,
  break: Break,
  headline: CommentBodyHeading,
  link: Editorial.A,
  paragraph: CommentBodyParagraph,
  bold: (props) => <strong {...props} />,
  italic: (props) => <em {...props} />,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
}
