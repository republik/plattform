import { useColorContext, Editorial } from '@project-r/styleguide'
import { IconRadioChecked, IconRadioUnchecked } from '@republik/icons'
import { AnswerText } from './AnswerText'

const ChoiceAnswerOption = ({ option, checked }) => {
  const [colorScheme] = useColorContext()
  const Icon = checked ? IconRadioChecked : IconRadioUnchecked
  return (
    <span
      style={{
        marginRight: '2em',
        display: 'flex',
        alignItems: 'center',
      }}
      {...colorScheme.set('color', checked ? 'text' : 'textSoft')}
    >
      {!!Icon && <Icon style={{ marginRight: 7, flexShrink: 0 }} />}
      {option?.label}
    </span>
  )
}

const ChoiceAnswer = ({ question, payload }) => (
  <span>
    {question.options.map((option, i) => (
      <ChoiceAnswerOption
        key={i}
        option={option}
        checked={payload?.value?.includes(option.value)}
      />
    ))}
  </span>
)

export const SubmissionQa = ({ question, payload }) => (
  <Editorial.P attributes={{}}>
    <strong>{question.text}</strong>
    <br />
    {question.__typename === 'QuestionTypeChoice' ? (
      <ChoiceAnswer question={question} payload={payload} />
    ) : (
      <AnswerText
        text={payload.text}
        value={payload.value}
        question={question}
        isQuote={false}
      />
    )}
  </Editorial.P>
)
