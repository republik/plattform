import React from 'react'
import { SchemaConfig } from '../custom-types'
import {
  Container,
  BlockQuote,
  BlockQuoteParagraph,
  Heading,
  Link,
  ListItem,
  Paragraph,
  StrikeThrough,
  Code,
  BlockCode,
} from '../../CommentBody/email'
import { List as InnerEmailList } from '../../CommentBody/email'
import {
  Byline,
  Caption,
} from '../../../templates/EditorialNewsletter/email/Figure'
import { Sub, Sup, Bold, Italic } from '../../Typography'
import { Break } from '../../Typography/Break'

const List: React.FC<{
  ordered: boolean
  attributes: any
  [x: string]: unknown
}> = ({ children, ordered }) => (
  <InnerEmailList data={{ ordered }}>{children}</InnerEmailList>
)

const schema: SchemaConfig = {
  container: Container,
  blockQuote: BlockQuote,
  blockQuoteText: BlockQuoteParagraph,
  figureByline: Byline,
  figureCaption: Caption,
  list: List,
  listItem: ListItem,
  break: Break,
  headline: Heading,
  link: Link,
  paragraph: Paragraph,
  bold: Bold,
  italic: Italic,
  strikethrough: StrikeThrough,
  sub: Sub,
  sup: Sup,
  inlineCode: Code,
  blockCode: BlockCode,
}

export default schema
