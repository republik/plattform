import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { sum } from 'd3-array'

import NextLink from 'next/link'

import {
  InlineSpinner,
  Interaction,
  Loader,
  Editorial,
  fontStyles,
  ColorContextProvider,
  colors,
  NarrowContainer,
  Container,
  Center,
} from '@project-r/styleguide'

import { css } from 'glamor'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import PlainButton from './PlainButton'

import {
  hasMoreData,
  loadMoreSubmissions,
  QUESTIONNAIRE_SUBMISSIONS_QUERY,
} from './graphql'
import AnswerText from './AnswerText'
import {
  AnswersChart,
  COLORS,
  getTargetedAnswers,
  PersonLink,
} from './QuestionFeatured'
import { ShareImageSplit } from './ShareImageSplit'
import Meta from '../../Frame/Meta'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { replaceText } from './utils'
import { questionColor } from '../../Climatelab/Questionnaire/config'
import { AnswersGrid, AnswersGridCard } from './AnswersGrid'

const QuestionViewMeta = ({ share, question }) => {
  const router = useRouter()
  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('extract', share.extract)
  const shareImageUrl = shareImageUrlObj.toString()

  return (
    <Meta
      data={{
        url,
        title: replaceText(share.title, { questionText: question.text }),
        description: share.description,
        image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
          shareImageUrl,
        )}`,
      }}
    />
  )
}

const QuestionView = ({ slug, questionIds, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, fetchMore } = useQuery(
    QUESTIONNAIRE_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 20,
        sortBy: 'random',
        questionIds,
      },
    },
  )

  const hasMore = hasMoreData(data)
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore: loadMoreSubmissions(fetchMore, data),
  })

  const allQuestions = data?.questionnaire?.questions
  const currentQuestions =
    allQuestions?.filter((q) => questionIds.includes(q.id)) ?? []
  const [mainQuestion, addQuestion] = currentQuestions
  if (extract) {
    return <ShareImageSplit question={mainQuestion} {...share} />
  }

  const isChoiceQuestion = mainQuestion?.__typename === 'QuestionTypeChoice'

  const colorMap = {}
  isChoiceQuestion &&
    mainQuestion.result.forEach(
      (bucket, index) => (colorMap[bucket.option.value] = COLORS[index]),
    )

  return (
    <>
      <Center>
        <Interaction.P style={{ fontSize: '1.1em' }}>
          <NextLink
            href={{
              pathname,
            }}
            passHref
          >
            <Editorial.A>Zurück zur Übersicht</Editorial.A>
          </NextLink>
        </Interaction.P>
      </Center>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results },
          } = data

          const targetAnswers = getTargetedAnswers(questionIds, results)

          return (
            <>
              <QuestionViewMeta share={share} question={mainQuestion} />
              <div style={{ backgroundColor: questionColor(mainQuestion.id) }}>
                <div
                  style={{
                    marginBottom: 20,
                    paddingTop: 50,
                  }}
                  ref={containerRef}
                >
                  <NarrowContainer>
                    <Editorial.Subhead style={{ textAlign: 'center' }}>
                      {mainQuestion.text}
                      {!isChoiceQuestion &&
                        !!addQuestion &&
                        ' ' + addQuestion.text}
                    </Editorial.Subhead>

                    {isChoiceQuestion && (
                      <>
                        <AnswersChart
                          question={mainQuestion}
                          skipTitle={true}
                        />
                        <br />
                        <Editorial.Subhead style={{ textAlign: 'center' }}>
                          {addQuestion.text}
                        </Editorial.Subhead>
                      </>
                    )}
                  </NarrowContainer>
                  <Container>
                    <AnswersGrid>
                      {targetAnswers.map(({ answers, displayAuthor }) => (
                        <AnswersGridCard
                          key={displayAuthor.slug}
                          textLength={sum(
                            answers,
                            (a) => a.payload.value.length,
                          )}
                        >
                          <PersonLink displayAuthor={displayAuthor}>
                            <a style={{ textDecoration: 'none' }}>
                              <div {...styles.answerCard}>
                                <ColorContextProvider
                                  localColorVariables={colors}
                                  colorSchemeKey='light'
                                >
                                  <Editorial.P attributes={{}}>
                                    <div
                                      {...(!isChoiceQuestion &&
                                        styles.answerCardContent)}
                                    >
                                      {answers.map((answer, idx) => {
                                        return (
                                          <div key={answer.id}>
                                            {isChoiceQuestion && idx === 0 ? (
                                              <div
                                                {...styles.circleLabel}
                                                style={{
                                                  color:
                                                    colorMap[
                                                      answer?.payload?.value
                                                    ],
                                                }}
                                              >
                                                <span
                                                  {...styles.circle}
                                                  style={{
                                                    backgroundColor:
                                                      colorMap[
                                                        answer?.payload?.value
                                                      ],
                                                  }}
                                                />
                                                <AnswerText
                                                  text={answer.payload.text}
                                                  value={answer.payload.value}
                                                  question={
                                                    currentQuestions[idx]
                                                  }
                                                />
                                              </div>
                                            ) : (
                                              <div
                                                {...(isChoiceQuestion &&
                                                  styles.answerCardContent)}
                                              >
                                                <AnswerText
                                                  text={answer.payload.text}
                                                  value={answer.payload.value}
                                                  question={
                                                    currentQuestions[idx]
                                                  }
                                                />
                                                <br />
                                                <br />

                                                {isChoiceQuestion && (
                                                  <em>
                                                    – {displayAuthor.name}
                                                  </em>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                      {!isChoiceQuestion && (
                                        <em>– {displayAuthor.name}</em>
                                      )}
                                    </div>
                                  </Editorial.P>
                                </ColorContextProvider>
                              </div>
                            </a>
                          </PersonLink>
                        </AnswersGridCard>
                      ))}
                    </AnswersGrid>
                  </Container>
                  <NarrowContainer>
                    <div style={{ marginTop: 10 }}>
                      {loadingMoreError && (
                        <ErrorMessage error={loadingMoreError} />
                      )}
                      {loadingMore && <InlineSpinner />}
                      {!infiniteScroll && hasMore && (
                        <PlainButton
                          onClick={() => {
                            setInfiniteScroll(true)
                          }}
                        >
                          {t.pluralize(
                            'questionnaire/submissions/showAnswers',
                            {
                              count: results.totalCount - results.nodes.length,
                            },
                          )}
                        </PlainButton>
                      )}
                    </div>
                  </NarrowContainer>
                </div>{' '}
              </div>
            </>
          )
        }}
      />
    </>
  )
}

export default QuestionView

const styles = {
  colorBar: css({
    position: 'absolute',
    left: -10,
    top: -10,
    height: '10px',
    width: '20%',
    borderTopLeftRadius: '2px',
  }),

  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    textAlign: 'center',
  }),
  answerCardContent: css({
    overflowWrap: 'break-word',
    hyphens: 'manual',
  }),
  circleLabel: css({
    ...fontStyles.sansSerifRegular16,
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    marginRight: 5,
  }),
}
