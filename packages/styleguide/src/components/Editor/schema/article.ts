import { SchemaConfig } from '../custom-types'
import { BlockQuote, BlockQuoteParagraph } from '../../BlockQuote'
import { FigureByline, FigureCaption } from '../../Figure'
import { Figure, FigureImage } from '../../Figure/Slate'
import { ListItem } from '../../List'
import { List } from '../../List/Slate'
import { PullQuote, PullQuoteSource, PullQuoteText } from '../../PullQuote'
import { Editorial, Sub, Sup } from '../../Typography'
import { Break } from '../../Typography/Break'
import { Marker } from '../../Marker'

const schema: SchemaConfig = {
  blockQuote: BlockQuote,
  blockQuoteText: BlockQuoteParagraph,
  figureByline: FigureByline,
  figureCaption: FigureCaption,
  figure: Figure,
  figureImage: FigureImage,
  ul: List,
  ol: List,
  listItem: ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: PullQuoteSource,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Editorial.Subhead,
  link: Editorial.A,
  memo: Marker,
  paragraph: Editorial.P,
  bold: Editorial.Emphasis,
  italic: Editorial.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
}

export default schema
