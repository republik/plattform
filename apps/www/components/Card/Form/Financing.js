import React, { useState, Fragment } from 'react'
import AutosizeInput from 'react-textarea-autosize'
import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'

import { Field, Interaction, mediaQueries } from '@project-r/styleguide'

import { styles as fieldSetStyles } from '../../FieldSet'
import withT from '../../../lib/withT'
import { css } from 'glamor'

const { H2, H3, P } = Interaction

const styles = {
  headline: css({
    marginTop: 40,
    marginBottom: 40,
  }),
  section: css({
    marginTop: 40,
  }),
  questionContainer: css({
    [mediaQueries.mUp]: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 20,
    },
  }),
  textQuestionContainer: css({
    [mediaQueries.mUp]: {
      paddingTop: 20,
    },
  }),
  question: css({
    [mediaQueries.mUp]: {
      paddingRight: 40,
    },
  }),
  field: css({
    paddingBottom: 20,
    [mediaQueries.mUp]: {
      flexBasis: 200,
      minWidth: 200,
    },
  }),
}

const sections = [1, 2, 3]

const questions = [
  {
    id: '1',
    section: 1,
  },
  {
    id: '1a',
    section: 1,
    requires: ['1'],
  },
  {
    id: '1b',
    section: 1,
    requires: ['1'],
  },
  {
    id: '1bI',
    section: 1,
    requires: ['1', '1b'],
  },
  {
    id: '1c',
    section: 1,
    requires: ['1'],
  },
  {
    id: '1cI',
    section: 1,
    type: 'text',
    transform: (v) => v,
    requires: ['1', '1c'],
  },
  {
    id: '1cII',
    section: 1,
    requires: ['1', '1c'],
  },
  {
    id: '1d',
    section: 1,
    requires: ['1'],
  },
  {
    id: '2',
    section: 2,
  },
  {
    id: '2a',
    section: 2,
    requires: ['2'],
  },
  {
    id: '2b',
    section: 2,
    requires: ['2'],
  },
  {
    id: '2c',
    section: 2,
    requires: ['2'],
  },
  {
    id: '2d',
    section: 2,
    requires: ['2'],
  },
  {
    id: '3',
    section: 3,
    type: 'text',
    transform: (v) => v,
  },
]

const FinancingQuestion = (props) => {
  const { locale, t } = props
  const { id, type, transform, requires } = props.question
  const { value, error, dirty } = props.financing.value[id] || {}

  const [financingQuestion, setFinancingQuestion] = useState({
    id,
    value: value || '',
    error: error || false,
    dirty: dirty || true,
  })

  const handleQuestion = (value, shouldValidate) => {
    const updateFinancingQuestion = {
      ...financingQuestion,
      value: (transform && transform(value)) || value.replace(/[^0-9]/g, ''),
      error: false,
      dirty: shouldValidate,
    }

    setFinancingQuestion(updateFinancingQuestion)

    props.onChange(updateFinancingQuestion)
  }

  if (
    requires &&
    !value &&
    !requires.every(
      (id) => props.financing.value[id] && +props.financing.value[id].value,
    )
  ) {
    return null
  }

  if (type === 'text') {
    return (
      <div {...styles.textQuestionContainer}>
        <div {...styles.question}>
          <P>
            {t.first([
              `components/Card/Form/Financing/question/${id}/${locale}`,
              `components/Card/Form/Financing/question/${id}`,
            ])}
          </P>
        </div>
        <div {...styles.field}>
          <Field
            label={t.first([
              `components/Card/Form/Financing/question/${id}/label/${locale}`,
              `components/Card/Form/Financing/question/${id}/label`,
              `components/Card/Form/Financing/question/label/${locale}`,
              'components/Card/Form/Financing/question/label',
            ])}
            renderInput={({ ref, ...inputProps }) => (
              <AutosizeInput
                {...inputProps}
                {...fieldSetStyles.autoSize}
                inputRef={ref}
              />
            )}
            value={financingQuestion.value}
            error={financingQuestion.dirty && financingQuestion.error}
            dirty={financingQuestion.dirty}
            onChange={(_, value, shouldValidate) =>
              handleQuestion(value, shouldValidate)
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div {...styles.questionContainer}>
      <div {...styles.question}>
        <P>
          {t.first([
            `components/Card/Form/Financing/question/${id}/${locale}`,
            `components/Card/Form/Financing/question/${id}`,
          ])}
        </P>
      </div>
      <div {...styles.field}>
        <Field
          label={t.first([
            `components/Card/Form/Financing/question/${id}/label/${locale}`,
            `components/Card/Form/Financing/question/${id}/label`,
            `components/Card/Form/Financing/question/label/${locale}`,
            'components/Card/Form/Financing/question/label',
          ])}
          value={financingQuestion.value}
          error={financingQuestion.dirty && financingQuestion.error}
          dirty={financingQuestion.dirty}
          onChange={(_, value, shouldValidate) =>
            handleQuestion(value, shouldValidate)
          }
        />
      </div>
    </div>
  )
}

const Financing = (props) => {
  const {
    router: {
      query: { locale },
    },
    t,
  } = props

  const [financing, setFinancing] = useState(props.financing || {})

  const handleFinancingQuestion = (value) => {
    const { id, error, dirty, ...response } = value

    const updatedFinancing = {
      ...financing,
      value: {
        ...financing.value,
        [value.id]: response,
      },
      error: false,
      dirty: false,
    }

    setFinancing(updatedFinancing)

    props.onChange(updatedFinancing.value)
  }

  return (
    <>
      <H2 {...styles.headline}>
        {t.first([
          `components/Card/Form/Financing/headline/${locale}`,
          'components/Card/Form/Financing/headline',
        ])}
      </H2>

      {sections.map((section) => (
        <Fragment key={`financing-section-${section}`}>
          <H3 {...styles.section}>
            {t.first([
              `components/Card/Form/Financing/section/${section}/${locale}`,
              `components/Card/Form/Financing/section/${section}`,
            ])}
          </H3>
          {questions
            .filter((q) => q.section === section)
            .map((question) => (
              <FinancingQuestion
                key={`financing-question-${question.id}`}
                question={question}
                financing={financing}
                onChange={handleFinancingQuestion}
                locale={locale}
                t={t}
              />
            ))}
        </Fragment>
      ))}
    </>
  )
}

export default compose(withRouter, withT)(Financing)
