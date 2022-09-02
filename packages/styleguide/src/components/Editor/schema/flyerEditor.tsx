import { SchemaConfig } from '../custom-types'
import { EditorQuizContainer, EditorQuizItem } from '../../Flyer/Quiz'
import { Flyer } from '../../Typography'
import { Invisible, Error } from '../Core/SpecialChars'

const schema: SchemaConfig = {
  link: Flyer.NoRefA,
  quizItem: EditorQuizItem,
  quiz: EditorQuizContainer,
  invisible: Invisible,
  error: Error,
}

export default schema
