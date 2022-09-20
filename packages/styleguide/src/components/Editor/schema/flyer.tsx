import { SchemaConfig } from '../custom-types'
import { Figure, FigureImage, FigureByline } from '../../Figure/Slate'
import { List } from '../../List/Slate'
import {
  ArticleLead,
  ArticlePreview,
  ArticleTextContainer,
  ArticleTitle,
  ArticleFormat,
} from '../../ArticlePreview'
import { FlyerTile } from '../../Flyer'
import { FlyerAuthor } from '../../Flyer/Author'
import { FlyerDate } from '../../Flyer/Date'
import { PullQuote, PullQuoteText } from '../../Flyer/PullQuote'
import { Quiz, QuizAnswer } from '../../Flyer/Quiz'
import { DefaultContainer } from '../Render/Containers'
import { Break } from '../../Typography/Break'
import { Sub, Sup, Flyer } from '../../Typography'

const schema: SchemaConfig = {
  container: Flyer.Layout,
  flyerTile: FlyerTile,
  flyerTileMeta: FlyerTile,
  flyerTileOpening: FlyerTile,
  flyerTileClosing: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: Flyer.MetaP,
  flyerOpeningP: Flyer.OpeningP,
  flyerPunchline: Flyer.Small,
  flyerSignature: Flyer.OpeningP,
  flyerDate: FlyerDate,
  flyerTitle: Flyer.H3,
  flyerTopic: Flyer.H2,
  articlePreview: ArticlePreview,
  articlePreviewTextContainer: ArticleTextContainer,
  articlePreviewFormat: ArticleFormat,
  articlePreviewTitle: ArticleTitle,
  articlePreviewLead: ArticleLead,
  figureByline: FigureByline,
  figureCaption: Flyer.Small,
  figure: Figure,
  figureImage: FigureImage,
  ul: List,
  ol: List,
  listItem: Flyer.ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: Flyer.Small,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Flyer.H1,
  link: Flyer.Link,
  paragraph: Flyer.P,
  bold: Flyer.Emphasis,
  italic: Flyer.Cursive,
  strikethrough: Flyer.StrikeThrough,
  sub: Sub,
  sup: Sup,
  quiz: Quiz,
  quizAnswer: QuizAnswer,
  quizAnswerInfo: DefaultContainer,
}

export default schema
