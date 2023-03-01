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
  Figure,
  FigureImage,
  TitleBlock,
  useHeaderHeight,
  ChevronLeftIcon,
  useColorContext,
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
import { ShareImageSplit } from '../../Questionnaire/Submissions/ShareImageSplit'
import {
  SubmissionQa,
  styles as submissionStyles,
} from '../../Questionnaire/Submissions/Submission'

import {
  EDIT_QUESTIONNAIRE_PATH,
  OVERVIEW_QUESTIONNAIRE_PATH,
  QUESTIONNAIRE_BG_COLOR,
  QUESTIONNAIRE_SLUG,
  QUESTIONNAIRE_SQUARE_IMG_URL,
} from './config'
import Link from 'next/link'

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

const Page = () => {
  const [headerHeight] = useHeaderHeight()
  const [colorScheme] = useColorContext()

  const { t } = useTranslation()

  const router = useRouter()
  const {
    query: { id, image },
  } = router

  const { me } = useMe()

  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('image', true)
  const shareImageUrl = shareImageUrlObj.toString()

  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug: QUESTIONNAIRE_SLUG,
      id,
      sortBy: 'random',
    },
  })

  const author = data?.questionnaire?.results?.nodes[0]?.displayAuthor
  const slug = author?.slug

  const { data: authorData } = useQuery(USER_QUERY, {
    skip: !slug,
    variables: {
      slug,
    },
  })

  if (image) {
    return (
      <ShareImageSplit
        user={!loading && author}
        img={QUESTIONNAIRE_SQUARE_IMG_URL}
      />
    )
  }

  const isOwnQuestionnaire = me?.id === authorData?.user?.id

  return (
    <Frame raw>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { questions, results },
          } = data
          const submission = results.nodes[0]
          if (!submission) return null

          const meta = {
            url,
            title: t('Climatelab/Questionnaire/title'),
            description: t('Climatelab/Questionnaire/description', {
              name: author?.name,
            }),
            image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
              shareImageUrl,
            )}`,
          }

          return (
            <>
              <Meta data={meta} />
              <div
                style={{
                  backgroundColor: QUESTIONNAIRE_BG_COLOR,
                  padding: '24px 0 24px',
                }}
              >
                <Figure
                  size='tiny'
                  attributes={{ style: { position: 'relative' } }}
                >
                  <FigureImage src={QUESTIONNAIRE_SQUARE_IMG_URL} />
                  {author?.profilePicture && (
                    <img
                      src={author.profilePicture}
                      style={{
                        position: 'absolute',
                        width: 80,
                        borderRadius: 80,
                        left: 'calc(50% + 30px)',
                        bottom: -45,
                        border: '1px solid black',
                      }}
                    />
                  )}
                </Figure>
                <div style={{ paddingTop: 24 }}>
                  <TitleBlock>
                    <Editorial.Headline>
                      15 Fragen zum Klima
                      {author?.name
                        ? ` – die Antworten von ${author.name}`
                        : ''}
                    </Editorial.Headline>
                    <Editorial.Lead>
                      Können Sie einer 5-Jährigen die Klimakrise erklären? Und
                      ihr dabei in die Augen schauen?
                    </Editorial.Lead>
                    <Editorial.Credit>
                      Von der{' '}
                      <Link href='/willkommen-zum-klimalabor' passHref>
                        <Editorial.A>Klimalabor-Crew</Editorial.A>
                      </Link>{' '}
                      und{' '}
                      <>
                        {author.slug ? (
                          <Link href={`/~${author.slug}`} passHref>
                            <Editorial.A>{author.name}</Editorial.A>
                          </Link>
                        ) : (
                          author.name
                        )}
                      </>
                    </Editorial.Credit>
                  </TitleBlock>
                </div>
              </div>
              <Center>
                <div
                  {...submissionStyles.header}
                  style={{
                    top: headerHeight,
                    padding: '10px 0',
                    marginBottom: 48,
                  }}
                  {...colorScheme.set('backgroundColor', 'default')}
                >
                  <div {...submissionStyles.headerText}>
                    <NextLink href={OVERVIEW_QUESTIONNAIRE_PATH} passHref>
                      <IconButton
                        size={24}
                        label='Zur Übersicht'
                        labelShort='Zur Übersicht'
                        Icon={ChevronLeftIcon}
                      />
                    </NextLink>
                  </div>
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
            </>
          )
        }}
      />
    </Frame>
  )
}

export default Page
