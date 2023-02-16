import { useState } from 'react'
import { useQuery } from '@apollo/client'

import { gql } from 'graphql-tag'
import { useRouter } from 'next/router'

import {
  Loader,
  Editorial,
  ShareIcon,
  IconButton,
  Center,
  Button,
} from '@project-r/styleguide'

import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { trackEvent } from '../../../lib/matomo'
import { useTranslation } from '../../../lib/withT'
import { postMessage, useInNativeApp } from '../../../lib/withInNativeApp'

import ShareOverlay from '../../ActionBar/ShareOverlay'
import Frame from '../../Frame'
import Meta from '../../Frame/Meta'
import { QUESTIONNAIRE_SUBMISSIONS_QUERY } from '../../Questionnaire/Submissions/graphql'
import { ShareImageSplit } from '../../Questionnaire/Submissions/ShareImageSplit'
import {
  SubmissionAuthor,
  SubmissionQa,
} from '../../Questionnaire/Submissions/Submission'

import { climateColors } from '../config'
import { useMe } from '../../../lib/context/MeContext'

const QUESTIONNAIRE_SLUG = 'sommer22'
const SHARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/dynamic-components/QUESTIONNAIRE_SUBMISSIONS/frame-sommer22.png'

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

const Questionnaire = ({ userId, meta }) => {
  const router = useRouter()
  // FIXME: not sure about this pathname, the url has no ? in it
  const pathname = router.asPath.split('?')[0]
  const { me } = useMe()
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug: QUESTIONNAIRE_SLUG,
      userIds: [userId],
      sortBy: 'random',
    },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions, results },
        } = data

        const submission = results.nodes[0]

        // FIXME: how can i check whether if submission is from the user that currently looks at this submission?

        // const isOwnQuestionnaire = me.slug === submission.slug

        // console.log(isOwnQuestionnaire)

        return (
          <div>
            <SubmissionAuthor
              displayAuthor={submission.displayAuthor}
              submissionUrl={pathname}
              createdAt={submission.createdAt}
              updatedAt={submission.updatedAt}
            >
              <ShareQuestionnaire meta={meta} />
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

            {/* FIXME: me abfragen und nur dann Fragebogen anzeigen, Link zu Zur Übersicht, Link hardcoded */}
            <Editorial.A href='/2023/02/13/klimafragebogen-fragen'>
              Fragebogen bearbeiten
            </Editorial.A>
            <br />
            <br />
            <Button
              onClick={() => {
                router.replace('/klimafragebogen')
              }}
            >
              Zur Übersicht
            </Button>
          </div>
        )
      }}
    />
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
        img={SHARE_IMG_URL}
      />
    )
  }

  return (
    <Frame customContentColorContext={climateColors}>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const { user } = data
          const meta = {
            url,
            title: t('Climatelab/Questionnaire/title', {
              name: user?.name || 'einer Verlegerin der Republik',
            }),
            description: t('Climatelab/Questionnaire/description'),
            image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
              shareImageUrl,
            )}`,
          }

          return (
            <Center>
              <Meta data={meta} />
              <Editorial.Headline>Klimafragebogen</Editorial.Headline>
              <Questionnaire userId={user?.id || slug} meta={meta} />
            </Center>
          )
        }}
      />
    </Frame>
  )
}

export default Page
