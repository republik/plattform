import { useMemo } from 'react'
import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'
import { Loader, ColorContextProvider, Center } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from './graphql'
import {
  QUESTION_SEPARATOR,
  LinkToEditQuestionnaire,
  QuestionFeatured,
} from './QuestionFeatured'
import QuestionView from './QuestionView'
import { getOrdinalColors } from './utils'

import { QuestionnaireConfig } from '../types/QuestionnaireConfig'
import { configs } from '../configs'
import { useTranslation } from 'lib/withT'

type AllQuestionsViewProps = {
  CONFIG: QuestionnaireConfig
  questionColor: (idx: number) => string
  extract?: boolean
  personPagePath: string
}

const AllQuestionsView = ({
  CONFIG,
  extract,
  questionColor,
  personPagePath,
}: AllQuestionsViewProps) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug: CONFIG.dbSlug },
  })

  // the extract flag is only used for custom share for in the QuestionView
  if (extract) return null

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions },
        } = data

        return (
          <div style={{ margin: '48px auto 0' }}>
            {CONFIG.questionsStruct.map((question, idx) => {
              const groupQuestions = question.ids.map((id) => questions[id])
              return (
                <QuestionFeatured
                  key={question.ids.join('+')}
                  questions={groupQuestions}
                  hint={question.hint}
                  slug={CONFIG.dbSlug}
                  bgColor={questionColor(idx)}
                  valueLength={question.valueLength}
                  personPagePath={personPagePath}
                />
              )
            })}
          </div>
        )
      }}
    />
  )
}

type SubmissionsOverviewProps = {
  configKey: string
  extract?: boolean
  share?: {
    extract: number
  }
}

const SubmissionsOverview = ({
  configKey,
  extract,
  share,
}: SubmissionsOverviewProps) => {
  const router = useRouter()
  const { query } = router
  const { t } = useTranslation()
  const questionIds: string[] | undefined =
    typeof query.share === 'string'
      ? query.share.split(QUESTION_SEPARATOR)
      : undefined
  const CONFIG: QuestionnaireConfig = configs[configKey]
  const questionColor = getOrdinalColors(CONFIG.design.colors)
  // we moved all share props which are unrelated to Publikator to the config file
  const shareData = {
    title: '{questionText}',
    description: t('questionnaire/submissions/shareText'),
    img: CONFIG.design.img.urlSquare,
    ...share,
  }
  const personPagePath = `fragebogen/${configKey}`

  return CONFIG ? (
    <>
      <ColorContextProvider colorSchemeKey='light'>
        {questionIds ? (
          <QuestionView
            slug={CONFIG.dbSlug}
            extract={extract}
            share={shareData}
            questionIds={questionIds}
            questionColor={questionColor}
            questions={CONFIG.questionsStruct}
            personPagePath={personPagePath}
            questionnaireBgColor={CONFIG.design.bgColor}
          />
        ) : (
          <AllQuestionsView
            CONFIG={CONFIG}
            questionColor={questionColor}
            extract={extract}
            personPagePath={personPagePath}
          />
        )}
      </ColorContextProvider>
      {!extract && (
        <Center attributes={{ style: { marginBottom: -48, marginTop: 20 } }}>
          <LinkToEditQuestionnaire
            slug={CONFIG.dbSlug}
            questionnairePath={CONFIG.paths.formPage}
            personPagePath={personPagePath}
          />
          <br />
        </Center>
      )}
    </>
  ) : null
}

export default SubmissionsOverview
