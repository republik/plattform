import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Button,
  InlineSpinner,
  Interaction,
  Loader,
  Breakout,
  Editorial,
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
  console.log(pathname)
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
    allQuestions?.filter((q) => questionIds.includes(q.id)) || []
  const [mainQuestion, addQuestion] = currentQuestions
  if (extract) {
    return <ShareImageSplit question={mainQuestion} {...share} />
  }

  return (
    <>
      <Button
        onClick={() => {
          router.replace({
            pathname,
          })
        }}
      >
        Zurück zur Übersicht
      </Button>
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
              <div
                style={{
                  marginBottom: 20,
                  paddingTop: 50,
                }}
                ref={containerRef}
              >
                <Interaction.H2>
                  {mainQuestion.text}
                  {!!addQuestion && ' ' + addQuestion.text}
                </Interaction.H2>

                {mainQuestion?.__typename === 'QuestionTypeChoice' && (
                  <AnswersChart question={mainQuestion} skipTitle={true} />
                )}

                <Breakout size='breakout'>
                  <div {...styles.answerGrid}>
                    {targetAnswers.map(({ answers, displayAuthor }) => (
                      <PersonLink
                        key={displayAuthor.slug}
                        displayAuthor={displayAuthor}
                      >
                        <div {...styles.answerCard}>
                          <Editorial.P attributes={{}}>
                            {answers.map((answer, idx) => {
                              const colorIndex =
                                mainQuestion?.__typename ===
                                  'QuestionTypeChoice' &&
                                mainQuestion.options
                                  .map((d) => d.value)
                                  .indexOf(answer.payload.value[0])

                              return (
                                <div
                                  style={{
                                    position: 'relative',
                                    color: '#000',
                                  }}
                                  key={answer.id}
                                >
                                  {answer?.question?.__typename !==
                                    'QuestionTypeChoice' && (
                                    <div
                                      style={{
                                        paddingTop: colorIndex ? '20px' : 0,
                                      }}
                                    >
                                      <AnswerText
                                        text={answer.payload.text}
                                        value={answer.payload.value}
                                        question={currentQuestions[idx]}
                                      />
                                      <br />
                                      <br />
                                    </div>
                                  )}

                                  {mainQuestion?.__typename ===
                                    'QuestionTypeChoice' &&
                                    idx < 1 && (
                                      <div
                                        {...styles.colorBar}
                                        style={{
                                          backgroundColor:
                                            colorIndex !== -1
                                              ? COLORS[colorIndex]
                                              : undefined,
                                        }}
                                      />
                                    )}
                                </div>
                              )
                            })}
                            <em
                              style={{
                                color: '#000',
                              }}
                            >
                              – {displayAuthor.name}
                            </em>
                          </Editorial.P>
                        </div>
                      </PersonLink>
                    ))}
                  </div>
                </Breakout>
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
                      {t.pluralize('questionnaire/submissions/showAnswers', {
                        count: results.totalCount - results.nodes.length,
                      })}
                    </PlainButton>
                  )}
                </div>
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
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '10px',
    backgroundColor: '#FFF',
    color: '#000',
    breakInside: 'avoid',
    overflowWrap: 'break-word',
    hyphens: 'manual',
  }),
}
