import { Editorial, useColorContext } from '@project-r/styleguide'

const QuestionIndex = ({ order, questionCount }) => {
  const [colorScheme] = useColorContext()
  return (
    <Editorial.P style={{ marginBottom: 5 }}>
      <span {...colorScheme.set('color', 'textSoft')}>
        {order + 1} von {questionCount}
      </span>
    </Editorial.P>
  )
}

export default QuestionIndex
