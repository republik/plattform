import { SchemaConfig } from '../custom-types'
import {
  CommentBodyBlockQuote,
  CommentBodyBlockQuoteParagraph,
  CommentBodyHeading,
  CommentBodyParagraph,
  CommentBodyContainer,
  CommentBodyCode,
  CommentBodyBlockCode,
} from '../../CommentBody/web'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../CommentBody/web/List'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup } from '../../Typography'
import { FigureByline, FigureCaption } from '../../Figure'
import { Bold } from '../config/marks/bold'
import { Italic } from '../config/marks/italic'

const schema: SchemaConfig = {
  container: CommentBodyContainer,
  blockQuote: CommentBodyBlockQuote,
  blockQuoteText: CommentBodyBlockQuoteParagraph,
  figureByline: FigureByline,
  figureCaption: FigureCaption,
  list: List,
  listItem: ListItem,
  break: Break,
  headline: CommentBodyHeading,
  link: Editorial.A,
  paragraph: CommentBodyParagraph,
  bold: Bold,
  italic: Italic,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
  inlineCode: CommentBodyCode,
  blockCode: CommentBodyBlockCode,
}

export default schema
