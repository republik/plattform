import { withDefaultSSR } from '../lib/apollo/helpers'
import { css } from 'glamor'
import {
  A,
  Center,
  Editorial,
  inQuotes,
  Interaction,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import {
  CDN_FRONTEND_BASE_URL,
  GENERAL_FEEDBACK_DISCUSSION_ID,
} from '../lib/constants'
import Frame from '../components/Frame'
import FontSizeSync from '../components/FontSize/Sync'
import { WithAccess } from '../components/Auth/withMembership'
import Link from 'next/link'
import DiscussionTitle from '../components/Dialog/DiscussionTitle'
import ActionBar from '../components/ActionBar'
import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'
import { Fragment } from 'react'
import ActiveDiscussions from '../components/Dialog/ActiveDiscussions'
import LatestComments from '../components/Dialog/LatestComments'
import { useTranslation } from '../lib/withT'
import { useRouter } from 'next/router'
import Discussion from '../components/Discussion/Discussion'
import DiscussionContextProvider from '../components/Discussion/context/DiscussionContextProvider'
import { useDiscussion } from '../components/Discussion/context/DiscussionContext'
import Meta from '../components/Frame/Meta'
import { getFocusUrl } from '../components/Discussion/shared/CommentLink'
import StatusError from '../components/StatusError'
import { IconDiscussion } from '@republik/icons'
import { DialogPaynote } from '@app/components/paynotes/paynotes-in-trial/dialog'

const styles = {
  container: css({
    // aligned with article view
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 25,
    },
  }),
  h3: css({
    marginTop: 30,
    [mediaQueries.mUp]: {
      marginTop: 60,
    },
    marginBottom: 20,
  }),
}

const H3 = ({ style, children }) => (
  <div {...styles.h3} style={style}>
    <Interaction.H3>{children}</Interaction.H3>
  </div>
)

const MaybeDiscussionContextProvider = ({ discussionId, children }) => {
  if (discussionId) {
    return (
      <DiscussionContextProvider discussionId={discussionId}>
        {children}
      </DiscussionContextProvider>
    )
  }
  return children
}

const SUPPORTED_TABS = ['general', 'article']
const DialogContent = ({ tab, activeDiscussionId, serverContext }) => {
  const { t } = useTranslation()
  const { query } = useRouter()
  const [colorScheme] = useColorContext()
  const discussionContext = useDiscussion()

  if (
    (discussionContext &&
      !discussionContext.loading &&
      !discussionContext.error &&
      !discussionContext.discussion) ||
    (tab === 'article' && !discussionContext) ||
    (tab && !SUPPORTED_TABS.includes(tab))
  ) {
    return <StatusError statusCode={404} serverContext={serverContext} />
  }

  // wait for loaded discussion object and skip if focus comment, handled by the provider
  const metaData =
    discussionContext?.discussion && !query.focus
      ? {
          title: t('discussion/meta/title', {
            quotedDiscussionTitle: inQuotes(discussionContext.discussion.title),
          }),
          url: getFocusUrl(discussionContext.discussion),
        }
      : !discussionContext && {
          title: t('pages/feedback/title'),
          image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
        }

  return (
    <>
      {metaData && <Meta data={metaData} />}
      <Center>
        <div {...styles.container}>
          {!tab && (
            <>
              <Interaction.Headline>{t('feedback/title')}</Interaction.Headline>
              <br />
              <WithAccess
                render={() => (
                  <>
                    <Interaction.P>{t('feedback/lead')}</Interaction.P>
                    <Interaction.P style={{ marginTop: 10 }}>
                      <Link
                        href={{
                          pathname: '/dialog',
                          query: { t: 'general' },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <A>{t('feedback/link/general')}</A>
                      </Link>
                    </Interaction.P>
                  </>
                )}
              />
            </>
          )}
          {!!tab && (
            <div style={{ marginBottom: 30 }}>
              <Editorial.Format color='primary'>
                <Link
                  href='/dialog'
                  passHref
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {t('feedback/title')}
                </Link>
              </Editorial.Format>
              <Interaction.H1>
                {tab === 'article' && <DiscussionTitle />}
                {tab === 'general' && t('feedback/general/title')}
              </Interaction.H1>
              {tab === 'general' && (
                <Interaction.P style={{ marginTop: 10 }}>
                  {t('feedback/general/lead')}
                </Interaction.P>
              )}
              <br />
              <ActionBar discussion={activeDiscussionId} fontSize />
            </div>
          )}
          {!discussionContext?.discussion?.userCanComment && <DialogPaynote />}
          {!tab && (
            <>
              <H3>{t('marketing/community/title/plain')}</H3>
              <TestimonialList
                singleRow
                minColumns={3}
                first={5}
                share={false}
              />
              <div style={{ marginTop: 10 }}>
                <Link href='/community' passHref legacyBehavior>
                  <A>{t('marketing/community/link')}</A>
                </Link>
              </div>
              <WithAccess
                render={() => (
                  <Fragment>
                    <H3
                      style={{
                        position: 'relative',
                        paddingRight: 40,
                      }}
                    >
                      {t('feedback/activeDiscussions/label')}
                      <span style={{ position: 'absolute', right: 0, top: -1 }}>
                        <IconDiscussion
                          size={24}
                          {...colorScheme.set('fill', 'primary')}
                        />
                      </span>
                    </H3>
                    <ActiveDiscussions first={5} />
                  </Fragment>
                )}
              />
            </>
          )}
          {activeDiscussionId && <Discussion />}
          {!tab && (
            <WithAccess
              render={() => (
                <Fragment>
                  <H3>{t('feedback/latestComments/headline')}</H3>
                  <LatestComments />
                </Fragment>
              )}
            />
          )}
        </div>
      </Center>
    </>
  )
}

const DialogPage = ({ serverContext }) => {
  const {
    query: { t: tab, id },
  } = useRouter()
  const activeDiscussionId =
    tab === 'general' ? GENERAL_FEEDBACK_DISCUSSION_ID : tab === 'article' && id

  return (
    <Frame
      hasOverviewNav
      raw
      formatColor='primary'
      // Only sticky if on /dialog without any query-params
      stickySecondaryNav={!tab && !id}
    >
      {!!tab && <FontSizeSync />}
      <MaybeDiscussionContextProvider discussionId={activeDiscussionId}>
        <DialogContent
          tab={tab}
          activeDiscussionId={activeDiscussionId}
          serverContext={serverContext}
        />
      </MaybeDiscussionContextProvider>
    </Frame>
  )
}

export default withDefaultSSR(DialogPage)
