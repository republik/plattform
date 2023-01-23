import { SchemaConfig } from '../custom-types'
import { EditorQuizContainer, EditorQuizItem } from '../../Flyer/Quiz'
import { Flyer } from '../../Typography'
import { Invisible, Error } from '../Core/SpecialChars'
import { EditorFlyerTile, FlyerTile } from '../../Flyer'
import { Marker } from '../../Marker'

const schema: SchemaConfig = {
  error: Error,
  flyerTileOpening: FlyerTile,
  flyerTile: EditorFlyerTile,
  invisible: Invisible,
  link: Flyer.NoRefA,
  memo: Marker,
  quiz: EditorQuizContainer,
  quizItem: EditorQuizItem,
}

export default schema
