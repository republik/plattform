import { ReactNode, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { useMutation, useQuery } from '@apollo/client'

import { css } from '@republik/theme/css'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import {
  QuestionnaireDocument,
  QuestionTypeChoice,
  SubmitQuestionnaireAnswerDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'

import { useTranslation } from 'lib/withT'

import { PaynoteSection } from '../../ui/containers'

import { Button } from '../../ui/button'
import { ArrowLink } from '../../ui/links'
import { Spinner } from '../../ui/spinner'

const SURVEY_SLUG = 'paywall'

// This button triggers the exit survey to open.
// We don't want to show this button if the users
// have previously answered the survey.
export function OpenSurveyButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  const { data, loading } = useQuery(QuestionnaireDocument, {
    variables: {
      slug: SURVEY_SLUG,
    },
  })
  if (loading || data?.questionnaire.questions[0]?.userAnswer) return null
  return (
    <Button type='button' variant='outline' size='full' onClick={onClick}>
      {t('paywall/offers/survey')}
    </Button>
  )
}

function AnswerButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <Button
      variant='outline'
      size='full'
      className={css({ fontWeight: 400 })}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function ThankYou() {
  const { t } = useTranslation()
  const trackEvent = useTrackEvent()
  return (
    <PaynoteSection>
      <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>
        {t('paywall/survey/thanks/title')}
      </p>
      <p className={css({ textStyle: 'body' })}>
        {t('paywall/survey/thanks/description')}
      </p>
      <ArrowLink
        href='/format/was-diese-woche-wichtig-war'
        onClick={() =>
          trackEvent({ action: 'Visited free wdwww newsletter page' })
        }
      >
        {t('paywall/survey/thanks/link')}
      </ArrowLink>
    </PaynoteSection>
  )
}

function SurveyQuestion({
  question,
  afterSubmit,
}: {
  question: QuestionTypeChoice
  afterSubmit: () => void
}) {
  const { options, text } = question
  const { t } = useTranslation()
  const [submitAnswer] = useMutation(SubmitQuestionnaireAnswerDocument)
  const trackEvent = useTrackEvent()

  const onSubmit = (value: string) => async (e: React.MouseEvent) => {
    e.preventDefault()
    await submitAnswer({
      variables: {
        questionId: question.id,
        answerId: uuid(),
        payload: { value: [value] },
      },
    })
    trackEvent({ action: 'Answered exit survey' })
    afterSubmit()
  }

  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '4' })}>
      <p className={css({ textStyle: 'airy', fontWeight: 'medium' })}>{text}</p>
      <p
        className={css({
          textStyle: 'body',
          color: 'textSoft',
          fontWeight: 'medium',
        })}
      >
        {t('paywall/survey/hint')}
      </p>
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          gap: '2',
        })}
      >
        {options?.map(({ label, value }, idx) => (
          <AnswerButton key={idx} onClick={onSubmit(value)}>
            {label}
          </AnswerButton>
        ))}
      </div>
    </div>
  )
}

export function ExitSurvey() {
  const [thankYou, showThankYou] = useState(false)

  const { data } = useQuery(QuestionnaireDocument, {
    variables: {
      slug: SURVEY_SLUG,
    },
    fetchPolicy: 'cache-only', // we already fetched the data in the button
  })

  const question = data?.questionnaire.questions[0] as QuestionTypeChoice

  useEffect(() => {
    // a user can only vote once
    if (question?.userAnswer) {
      showThankYou(true)
    }
  }, [question])

  return (
    <div
      className={css({
        borderTop: '2px solid',
        borderColor: 'text.black',
      })}
    >
      {thankYou ? (
        <ThankYou />
      ) : (
        <PaynoteSection>
          {!question ? (
            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Spinner size='large' />
            </div>
          ) : (
            <SurveyQuestion
              question={question}
              afterSubmit={() => showThankYou(true)}
            />
          )}
        </PaynoteSection>
      )}
    </div>
  )
}
