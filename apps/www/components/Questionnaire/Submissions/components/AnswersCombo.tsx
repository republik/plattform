import { css } from 'glamor'

import {
  Editorial,
  fontStyles,
  ColorContextProvider,
  mediaQueries,
  convertStyleToRem,
} from '@project-r/styleguide'

import { AnswerText } from './AnswerText'

const Credit = ({ author }) => (
  <Editorial.Credit
    style={{
      marginTop: '0',
      paddingTop: '5px',
    }}
  >
    Von{' '}
    <span
      style={{
        textDecoration: 'underline',
      }}
    >
      {author.name}
    </span>
  </Editorial.Credit>
)

const AnswerCard = ({ children }) => (
  <div {...styles.answerCard}>
    <ColorContextProvider colorSchemeKey='light'>
      {children}
    </ColorContextProvider>
  </div>
)

type AnswerComboProps = {
  answers: any[]
  author: any
  questions: any[]
  questionsType: 'choice-text' | 'text-text' | 'text'
}

// Possible combos:
// - choice question + text question
// - text question + text question
// - text question
export const AnswersCombo = ({
  answers,
  author,
  questions,
  questionsType,
}: AnswerComboProps) => {
  if (questionsType === 'choice-text') {
    return (
      <AnswerCard>
        <div {...styles.circleLabel}>
          <span {...styles.circle} />
          <AnswerText
            text={answers[0].payload.text}
            value={answers[0].payload.value}
            question={questions[0]}
            isQuote
          />
        </div>
        <AnswerText
          text={answers[1].payload.text}
          value={answers[1].payload.value}
          question={questions[1]}
          isQuote
        />
        <Credit author={author} />
      </AnswerCard>
    )
  } else if (questionsType === 'text-text') {
    return (
      <AnswerCard>
        <AnswerText
          text={answers[0].payload.text}
          value={answers[0].payload.value}
          question={questions[0]}
          isQuote
        />
        <hr
          style={{
            opacity: 0.3,
            margin: '1.2em 33%',
            border: 0,
            borderTop: '1px solid currentColor',
          }}
        />
        <AnswerText
          text={answers[1].payload.text}
          value={answers[1].payload.value}
          question={questions[1]}
          isQuote
        />
        <Credit author={author} />
      </AnswerCard>
    )
  }

  // questionType === 'text'
  return (
    <AnswerCard>
      <AnswerText
        text={answers[0].payload.text}
        value={answers[0].payload.value}
        question={questions[0]}
        isQuote
      />
      <Credit author={author} />
    </AnswerCard>
  )
}

const styles = {
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 30,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 20,
    transition: 'all .3s ease-in-out',
    overflowWrap: 'break-word',
    hyphens: 'manual',
    ...convertStyleToRem(fontStyles.serifBold17),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifBold19),
    },
    ':hover': {
      transform: 'scale(1.03) !important',
      '& span': {
        color: '#757575',
      },
    },
  }),
  circleLabel: css({
    ...fontStyles.sansSerifRegular16,
    marginBottom: 20,
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    marginRight: 5,
    backgroundColor: `currentColor`,
    opacity: 0.7,
  }),
}
