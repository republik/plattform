import questionStyles from './questionStyles'
import { Editorial } from '@project-r/styleguide'

const QuestionHeader = ({ metadata }) => {
  const questionHeader = metadata && metadata.questionHeader
  if (!questionHeader) {
    return null
  }
  return (
    <div {...questionStyles.subheadOuter}>
      <Editorial.Subhead {...questionStyles.subhead}>
        <span {...questionStyles.subheadInner}>{questionHeader}</span>
      </Editorial.Subhead>
    </div>
  )
}

export default QuestionHeader
