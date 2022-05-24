import { SchemaConfig } from '../custom-types'
import { BlockQuote, BlockQuoteParagraph } from '../../BlockQuote'
import { FigureByline, FigureCaption } from '../../Figure'
import { FigureContainer } from '../config/elements/figure/container'
import { FigureImage } from '../config/elements/figure/image'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../List'
import { PullQuote, PullQuoteSource, PullQuoteText } from '../../PullQuote'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup } from '../../Typography'

const schema: SchemaConfig = {
  blockQuote: BlockQuote,
  blockQuoteText: BlockQuoteParagraph,
  figureByline: FigureByline,
  figureCaption: FigureCaption,
  figure: FigureContainer,
  figureImage: FigureImage,
  list: List,
  listItem: ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: PullQuoteSource,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Editorial.Subhead,
  link: Editorial.A,
  paragraph: Editorial.P,
  bold: Editorial.Emphasis,
  italic: Editorial.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
}

export default schema
