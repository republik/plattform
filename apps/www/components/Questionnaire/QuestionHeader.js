import { BlockQuote, BlockQuoteParagraph } from '@project-r/styleguide'

const QuestionHeader = ({ metadata }) => {
  const questionHeader = metadata && metadata.questionHeader
  if (!questionHeader || !questionHeader.text) {
    return null
  }
  return (
    <BlockQuote>
      <BlockQuoteParagraph>{questionHeader.text}</BlockQuoteParagraph>
    </BlockQuote>
  )
}

export default QuestionHeader
