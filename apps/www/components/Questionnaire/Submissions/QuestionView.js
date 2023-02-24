import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import NextLink from 'next/link'

import {
  Button,
  InlineSpinner,
  Interaction,
  Loader,
  Breakout,
  Editorial,
  fontStyles,
  ColorContextProvider,
  colors,
  NarrowContainer,
  Container,
  A,
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

const QuestionView = ({ slug, questionIds, extract, share = {}, bgColor }) => {
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
      <NarrowContainer>
        <NextLink
          href={{
            pathname,
          }}
          passHref
        >
          <A>Zurück zur Übersicht</A>
        </NextLink>
      </NarrowContainer>
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
                    <Editorial.Subhead>
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
                        <Editorial.Subhead>
                          {addQuestion.text}
                        </Editorial.Subhead>
                      </>
                    )}
                  </NarrowContainer>
                  <Container>
                    <div {...styles.answerGrid}>
                      {targetAnswers.map(({ answers, displayAuthor }) => (
                        <PersonLink
                          key={displayAuthor.slug}
                          displayAuthor={displayAuthor}
                        >
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
                                              question={currentQuestions[idx]}
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
                                              question={currentQuestions[idx]}
                                            />
                                            <br />
                                            <br />

                                            {isChoiceQuestion && (
                                              <em>– {displayAuthor.name}</em>
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
                        </PersonLink>
                      ))}
                    </div>
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
  answerGrid: css({
    marginTop: 50,
    columnWidth: '300px',
    gap: '1rem',
  }),
  answerCard: css({
    cursor: 'pointer',
    breakInside: 'avoid',
  }),
  answerCardContent: css({
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '10px',
    backgroundColor: '#FFF',
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
