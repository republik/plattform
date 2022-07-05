import { SchemaConfig } from '../custom-types'
import { FigureByline, FigureCaption } from '../../Figure'
import { FigureContainer } from '../config/elements/figure/container'
import { FigureImage } from '../config/elements/figure/image'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../List'
import { PullQuote, PullQuoteSource, PullQuoteText } from '../../PullQuote'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup } from '../../Typography'
import { NoRefEditoralA } from '../config/elements/link'
import { FlyerTile } from '../config/elements/flyerTile'
import { FlyerAuthor } from '../config/elements/flyerTile/elements/author'
import { FlyerMetaP } from '../config/elements/flyerTile/elements/metaP'
import { FlyerPunchline } from '../config/elements/flyerTile/elements/punchline'
import { FlyerTitle } from '../config/elements/flyerTile/elements/title'
import { FlyerTopic } from '../config/elements/flyerTile/elements/topic'
import { ArticlePreview } from '../config/elements/articlePreview'

const schema: SchemaConfig = {
  flyerTile: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: FlyerMetaP,
  flyerPunchline: FlyerPunchline,
  flyerTitle: FlyerTitle,
  flyerTopic: FlyerTopic,
  articlePreview: ArticlePreview,
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
  headline: Editorial.Headline,
  link: NoRefEditoralA,
  paragraph: Editorial.P,
  bold: Editorial.Emphasis,
  italic: Editorial.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
}

export default schema
