import { useState } from 'react'
import { useQuery } from '@apollo/client'

import { gql } from 'graphql-tag'
import { useRouter } from 'next/router'
import NextLink from 'next/link'

import {
  Loader,
  Editorial,
  ShareIcon,
  IconButton,
  Center,
  Interaction,
  EditIcon,
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

import { useMe } from '../../../lib/context/MeContext'
import { EDIT_QUESTIONNAIRE_PATH } from './config'

const QUESTIONNAIRE_SLUG = 'klima-fragebogen'
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
  const pathname = router.asPath
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
        return (
          <div>
            <SubmissionAuthor
              displayAuthor={submission.displayAuthor}
              submissionUrl={pathname}
              createdAt={submission.createdAt}
              updatedAt={submission.updatedAt}
            >
              <ShareQuestionnaire meta={meta} />
              {me.id === userId && (
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
    <Frame>
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
              {/* FIXME: me abfragen und nur dann Fragebogen anzeigen, Link zu Zur Übersicht, Link hardcoded */}
              <div style={{ marginBottom: 20 }}>
                <Interaction.P>
                  <NextLink href={'/klimafragebogen'} passHref>
                    <Editorial.A>Zurück zur Übersicht</Editorial.A>
                  </NextLink>
                </Interaction.P>
              </div>
              <Questionnaire userId={user?.id || slug} meta={meta} />
            </Center>
          )
        }}
      />
    </Frame>
  )
}

export default Page
