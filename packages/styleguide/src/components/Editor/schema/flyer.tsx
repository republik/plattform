import { SchemaConfig } from '../custom-types'

import { FigureByline, FigureCaption } from '../../Figure'
import { Figure, FigureImage } from '../../Figure/Slate'
import { ListItem } from '../../List'
import { List } from '../../List/Slate'
import { PullQuoteSource } from '../../PullQuote'
import { ArticlePreview } from '../../ArticlePreview'
import { FlyerTile } from '../../Flyer'
import { FlyerAuthor } from '../../Flyer/Author'
import { PullQuote, PullQuoteText } from '../../Flyer/PullQuote'
import { Quiz, QuizAnswer } from '../../Flyer/Quiz'
import { DefaultContainer } from '../components/render/Containers'
import { Break } from '../../Typography/Break'
import { Editorial, Sub, Sup, Interaction, Flyer } from '../../Typography'

const schema: SchemaConfig = {
  container: Flyer.Layout,
  flyerTile: FlyerTile,
  flyerTileMeta: FlyerTile,
  flyerTileOpening: FlyerTile,
  flyerTileClosing: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: Flyer.MetaP,
  flyerPunchline: FigureCaption,
  flyerSignature: Flyer.Small,
  flyerTitle: Flyer.H2,
  flyerTopic: Flyer.H3,
  articlePreview: ArticlePreview,
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
  headline: Flyer.H1,
  link: Flyer.A,
  paragraph: Flyer.P,
  bold: Interaction.Emphasis,
  italic: Interaction.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
  quiz: Quiz,
  quizAnswer: QuizAnswer,
  quizAnswerInfo: DefaultContainer,
}

export default schema
