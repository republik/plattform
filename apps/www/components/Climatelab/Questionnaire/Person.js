import { gql } from 'graphql-tag'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { useQuery } from '@apollo/client'

import {
  Loader,
  Editorial,
  ShareIcon,
  IconButton,
  Center,
  EditIcon,
  DynamicComponent,
} from '@project-r/styleguide'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { useMe } from '../../../lib/context/MeContext'
import { postMessage, useInNativeApp } from '../../../lib/withInNativeApp'
import { trackEvent } from '../../../lib/matomo'
import { useTranslation } from '../../../lib/withT'

import ShareOverlay from '../../ActionBar/ShareOverlay'

import Frame from '../../Frame'
import Meta from '../../Frame/Meta'

import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from '../../Questionnaire/Submissions/graphql'
import { LinkToEditQuestionnaire } from '../../Questionnaire/Submissions/QuestionFeatured'
import { ShareImageSplit } from '../../Questionnaire/Submissions/ShareImageSplit'
import {
  SubmissionAuthor,
  SubmissionQa,
} from '../../Questionnaire/Submissions/Submission'

import {
  EDIT_QUESTIONNAIRE_PATH,
  OVERVIEW_QUESTIONNAIRE_PATH,
  QUESTIONNAIRE_SLUG,
  QUESTIONNAIRE_SQUARE_IMG_URL,
} from './config'

const USER_QUERY = gql`
  query getUserId($slug: String!) {
    user(slug: $slug) {
      id
      name
      statement
      portrait
    }
  }
`

const ShareQuestionnaire = ({ meta }) => {
  const { t } = useTranslation()
  const { inNativeApp } = useInNativeApp()
  const [overlay, showOverlay] = useState(false)
  const { url, title } = meta

  return (
    <>
      <IconButton
        label={t('article/actionbar/share')}
        labelShort={t('article/actionbar/share')}
        Icon={ShareIcon}
        href={url}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(['ActionBar', 'shareJournalLink', url])
          if (inNativeApp) {
            postMessage({
              type: 'share',
              payload: {
                title: title,
                url,
                subject: '',
                dialogTitle: t('article/share/title'),
              },
            })
            e.target.blur()
          } else {
            showOverlay(!overlay)
          }
        }}
      />
      {!!overlay && (
        <ShareOverlay
          onClose={() => showOverlay(false)}
          url={url}
          title={t('article/actionbar/share')}
          tweet=''
          emailSubject={t('article/share/emailSubject', {
            title: title,
          })}
          emailBody=''
          emailAttachUrl
        />
      )}
    </>
  )
}

const OverviewLink = () => (
  <NextLink href={OVERVIEW_QUESTIONNAIRE_PATH} passHref>
    <Editorial.A>Übersicht</Editorial.A>
  </NextLink>
)

const Questionnaire = ({ userId, meta }) => {
  const router = useRouter()
  const pathname = router.asPath
  const { me } = useMe()
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug: QUESTIONNAIRE_SLUG,
      userIds: [userId],
      sortBy: 'random',
    },
  })
  const isOwnQuestionnaire = me?.id === userId

  return (
    <>
      {isOwnQuestionnaire ? (
        <Editorial.P>
          Zurück zur <OverviewLink />.
        </Editorial.P>
      ) : (
        <LinkToEditQuestionnaire slug={QUESTIONNAIRE_SLUG}>
          <span>
            {' '}
            Oder gehen Sie zurück zur <OverviewLink />.
          </span>
        </LinkToEditQuestionnaire>
      )}

      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { questions, results },
          } = data
          const submission = results.nodes[0]
          if (!submission) return null
          return (
            <div>
              <SubmissionAuthor
                displayAuthor={submission.displayAuthor}
                submissionUrl={pathname}
                createdAt={submission.createdAt}
                updatedAt={submission.updatedAt}
              >
                <ShareQuestionnaire meta={meta} />
                {isOwnQuestionnaire && (
                  <IconButton
                    size={24}
                    label='Bearbeiten'
                    labelShort=''
                    Icon={EditIcon}
                    href={EDIT_QUESTIONNAIRE_PATH}
                  />
                )}
              </SubmissionAuthor>
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
            </div>
          )
        }}
      />
    </>
  )
}

const Page = () => {
  const { t } = useTranslation()

  const router = useRouter()
  const {
    query: { slug, image },
  } = router

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  const { loading, error, data } = useQuery(USER_QUERY, {
    variables: {
      slug,
    },
  })

  if (image) {
    return (
      <ShareImageSplit
        user={!loading && (data?.user || {})}
        img={QUESTIONNAIRE_SQUARE_IMG_URL}
      />
    )
  }

  return (
    <Frame>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { user } = data
          const meta = {
            url,
            title: t('Climatelab/Questionnaire/title'),
            description: t('Climatelab/Questionnaire/description', {
              name: user?.name,
            }),
            image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
              shareImageUrl,
            )}`,
          }

          return (
            <Center>
              <Meta data={meta} />
              <Editorial.Headline>Klimafragebogen</Editorial.Headline>
              <Questionnaire userId={user?.id || slug} meta={meta} />
              <Editorial.Subhead attributes={{}}>
                Wer fehlt noch?
              </Editorial.Subhead>
              <Editorial.P>
                Wer in Ihrem Umfeld würde wohl Antworten geben, die sich von
                Ihren maximal unterscheiden? Oder wessen Antworten würden Sie
                einfach sehr gerne hier lesen? Machen Sie Freunde und Bekannte
                auf den Fragebogen aufmerksam, per Direktnachricht oder via
                Social Media.
              </Editorial.P>
              <DynamicComponent
                src='https://cdn.repub.ch/s3/republik-assets/dynamic-components/101-reasons/share.js?v=3'
                props={{
                  url: `https://www.republik.ch${EDIT_QUESTIONNAIRE_PATH}`,
                  body: `Die Republik hat 15 knifflige Fragen zum Klima zusammengestellt. Mich würde sehr interessieren, wie du sie beantwortest. Hier geht’s zum Fragebogen: www.republik.ch${EDIT_QUESTIONNAIRE_PATH}`,
                  icons: [
                    'linkedin',
                    'facebook',
                    'twitter',
                    'whatsapp',
                    'messenger',
                    'telegram',
                    'threema',
                    'sms',
                    'copy',
                  ],
                }}
              />
            </Center>
          )
        }}
      />
    </Frame>
  )
}

export default Page
