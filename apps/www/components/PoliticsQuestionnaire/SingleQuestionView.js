import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import NextLink from 'next/link'

import scrollIntoView from 'scroll-into-view'

import {
  Interaction,
  inQuotes,
  Editorial,
  fontStyles,
  ColorContextProvider,
  colors,
  mediaQueries,
  convertStyleToRem,
  Center,
} from '@project-r/styleguide'

import {
  AnswersGrid,
  AnswersGridCard,
} from '../Questionnaire/Submissions/AnswersGrid'

import { css } from 'glamor'

import { useTranslation } from '../../lib/withT'

import { SubmissionLink } from './Overview'

import { ShareImageSplit } from '../Questionnaire/Submissions/ShareImageSplit'
import Meta from '../Frame/Meta'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { questionColor, QUESTIONS, OVERVIEW_QUESTIONNAIRE_PATH } from './config'

const QuestionViewMeta = ({ share, question }) => {
  const router = useRouter()
  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  return (
    <Meta
      data={{
        url,
        title: question,
        description: 'Beschreibung',
        image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
          shareImageUrl,
        )}`,
      }}
    />
  )
}

const Page = ({ question, answers }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]

  const answerGridRef = useRef()
  // useEffect(() => {
  //   if (extract) return
  //   scrollIntoView(answerGridRef.current)
  // }, [])

  // if (extract) {
  //   return <ShareImageSplit question={mainQuestion} {...share} />
  // }

  // const isChoiceQuestion = mainQuestion?.__typename === 'QuestionTypeChoice'

  // const questionGroupIdx = QUESTIONS.findIndex(
  //   (q) => allQuestions && allQuestions[q.ids[0]]?.id === questionIds[0],
  // )

  return (
    <div ref={answerGridRef}>
      <QuestionViewMeta question={question} />
      <div style={{ backgroundColor: questionColor(0) }}>
        <div
          style={{
            marginTop: 48,
            marginBottom: 20,
            paddingTop: 24,
          }}
          // ref={containerRef}
        >
          <Center>
            <div style={{ textAlign: 'center' }}>
              <Interaction.P>
                <NextLink href={OVERVIEW_QUESTIONNAIRE_PATH} passHref>
                  <Editorial.A>Zurück zur Übersicht</Editorial.A>
                </NextLink>
              </Interaction.P>
            </div>

            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <div {...styles.answerCardWrapper}>
                {answers.map(({ uuid, answer, name }) => (
                  <AnswersGridCard key={uuid}>
                    <SubmissionLink id={uuid}>
                      <a style={{ textDecoration: 'none' }}>
                        <div {...styles.answerCard}>
                          <div>
                            <Editorial.Question style={{ marginTop: 0 }}>
                              {inQuotes(answer)}
                            </Editorial.Question>
                            <Editorial.Credit
                              style={{
                                marginTop: '0',
                                paddingTop: '20px',
                              }}
                            >
                              Von{' '}
                              <span style={{ textDecoration: 'underline' }}>
                                {name}
                              </span>
                            </Editorial.Credit>
                          </div>
                        </div>
                      </a>
                    </SubmissionLink>
                  </AnswersGridCard>
                ))}
              </div>
            </ColorContextProvider>
          </Center>
        </div>
      </div>
    </div>
  )
}

export default Page

const styles = {
  answerCardWrapper: css({
    marginTop: 40,
  }),
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
    ':hover': {
      transform: 'scale(1.03) !important',
      '& span': {
        color: '#757575',
      },
    },
  }),
  answerCardContent: css({
    overflowWrap: 'break-word',
    hyphens: 'manual',
    ...convertStyleToRem(fontStyles.serifBold17),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifBold19),
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
