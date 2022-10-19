import { SchemaConfig } from '../custom-types'
import { Figure, FigureImage, FigureByline } from '../../Figure/Slate'
import {
  ArticleLead,
  ArticlePreview,
  ArticleTextContainer,
  ArticleTitle,
  ArticleFormat,
} from '../../ArticlePreview'
import { FlyerTile, FlyerTileOpening } from '../../Flyer'
import { FlyerAuthor } from '../../Flyer/Author'
import { FlyerNav } from '../../Flyer/Date'
import { PullQuote, PullQuoteText } from '../../Flyer/PullQuote'
import { Quiz, QuizAnswer } from '../../Flyer/Quiz'
import { DefaultContainer } from '../Render/Containers'
import { Break } from '../../Typography/Break'
import { Sub, Sup, Flyer } from '../../Typography'
import { Memo } from '../Forms/Memo/Markers'

const schema: SchemaConfig = {
  container: Flyer.Layout,
  flyerTile: FlyerTile,
  flyerTileMeta: FlyerTile,
  flyerTileOpening: FlyerTileOpening,
  flyerTileClosing: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: Flyer.MetaP,
  flyerOpeningP: Flyer.OpeningP,
  flyerPunchline: Flyer.Small,
  flyerSignature: Flyer.OpeningP,
  // TODO: rename to flyerNav
  flyerDate: FlyerNav,
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
  ul: Flyer.UL,
  ol: Flyer.OL,
  listItem: Flyer.ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: Flyer.Small,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Flyer.H1,
  link: Flyer.Link,
  memo: Memo,
  paragraph: Flyer.P,
  bold: Flyer.Emphasis,
  italic: Flyer.Cursive,
  strikethrough: Flyer.StrikeThrough,
  sub: Sub,
  sup: Sup,
  quiz: Quiz,
  quizAnswer: QuizAnswer,
  quizAnswerInfo: DefaultContainer,
  quizAnswerInfoP: Flyer.P,
}

export default schema
