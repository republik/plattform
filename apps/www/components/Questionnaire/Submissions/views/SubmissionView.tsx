import { useEffect, useRef } from 'react'

import { useRouter } from 'next/router'

import scrollIntoView from 'scroll-into-view'

import { useTranslation } from 'lib/withT'

import { useQuery } from '@apollo/client'
import {
  Loader,
  Center,
  ColorContextProvider,
  Editorial,
  useHeaderHeight,
} from '@project-r/styleguide'

import { OverviewLink } from '../components/Links'
import { SubmissionQa } from '../components/QaEditorial'
import QuestionnaireMeta from '../components/QuestionnaireMeta'
import { ShareImage } from '../components/ShareImage'
import { QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY } from '../graphql'

const SubmissionView = ({
  questionnaireConfig,
  submissionId,
  extract,
  share,
  title,
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = router.asPath.split('?')[0]
  const [headerHeight] = useHeaderHeight()

  const { loading, error, data } = useQuery(
    QUESTIONNAIRE_WITH_SUBMISSIONS_QUERY,
    {
      variables: {
        slug: questionnaireConfig.dbSlug,
        id: submissionId,
        sortBy: 'random',
      },
    },
  )
  const author = data?.questionnaire?.results?.nodes[0]?.displayAuthor
  const subheadText = t('questionnaire/submission/description').replace(
    '{name}',
    author?.name,
  )
  const shareText = `${title}: ${subheadText}`

  const submissionRef = useRef(null)
  useEffect(() => {
    if (extract) return
    scrollIntoView(submissionRef.current, {
      time: 0,
      align: { topOffset: headerHeight, top: 0 },
    })
  }, [])

  if (extract) {
    return (
      <ShareImage
        text={shareText}
        img={questionnaireConfig.design.shareImg}
        bgColor={questionnaireConfig.design.bgColor}
      />
    )
  }

  return (
    <div ref={submissionRef}>
      <Loader
        loading={loading}
        render={() => {
          if (error) {
            if (process.browser) {
              router.replace({ pathname })
            }
            return null
          }
          const {
            questionnaire: { questions, results },
          } = data
          const submission = results.nodes[0]
          if (!submission) {
            if (process.browser) {
              router.replace({ pathname })
            }
            return null
          }

          return (
            <>
              <QuestionnaireMeta share={share} shareText={shareText} />
              <ColorContextProvider colorSchemeKey='light'>
                <div
                  ref={submissionRef}
                  style={{
                    backgroundColor: questionnaireConfig.design.bgColor,
                    padding: '20px 0',
                  }}
                >
                  <Center>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                      <OverviewLink />
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 20,
                        marginBottom: 20,
                        textAlign: 'left',
                      }}
                    >
                      {author?.profilePicture && (
                        <img
                          src={author.profilePicture}
                          style={{
                            width: 80,
                            borderRadius: 80,
                          }}
                          alt='profile picture'
                        />
                      )}
                      <Editorial.Subhead style={{ marginTop: 0 }}>
                        {subheadText}
                      </Editorial.Subhead>
                    </div>

                    {submission?.answers?.nodes.map(
                      ({ id, question: { id: qid }, payload }) => {
                        const question = questions.find((q) => q.id === qid)
                        return (
                          <SubmissionQa
                            key={id}
                            question={question}
                            payload={payload}
                          />
                        )
                      },
                    )}
                  </Center>
                </div>
              </ColorContextProvider>
            </>
          )
        }}
      />
    </div>
  )
}

export default SubmissionView
