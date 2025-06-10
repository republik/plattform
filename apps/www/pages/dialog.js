import { withDefaultSSR } from '../lib/apollo/helpers'
import { css } from 'glamor'
import {
  Center,
  Editorial,
  inQuotes,
  Interaction,
  mediaQueries,
} from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import Frame from '../components/Frame'
import Link from 'next/link'
import { useTranslation } from '../lib/withT'
import { useRouter } from 'next/router'
import Discussion from '../components/Discussion/Discussion'
import DiscussionContextProvider from '../components/Discussion/context/DiscussionContextProvider'
import { useDiscussion } from '../components/Discussion/context/DiscussionContext'
import Meta from '../components/Frame/Meta'
import { getFocusUrl } from '../components/Discussion/shared/CommentLink'
import StatusError from '../components/StatusError'
import { DialogPaynote } from '@app/components/paynotes/paynotes-in-trial/dialog'
import DiscussionTitle from '../components/Dialog/DiscussionTitle'
import ActionBar from '../components/ActionBar'
import DialogOverviewPage from '../components/Dialog/Page'

const styles = {
  container: css({
    // aligned with article view
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 25,
    },
  }),
}

export const MaybeDiscussionContextProvider = ({ discussionId, children }) => {
  if (discussionId) {
    return (
      <DiscussionContextProvider discussionId={discussionId}>
        {children}
      </DiscussionContextProvider>
    )
  }
  return children
}

const DialogContent = ({ activeDiscussionId, serverContext }) => {
  const { t } = useTranslation()
  const { query } = useRouter()
  const discussionContext = useDiscussion()

  if (
    discussionContext &&
    !discussionContext.loading &&
    !discussionContext.error &&
    !discussionContext.discussion
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
          {activeDiscussionId ? (
            // Discussion page
            <>
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
                  <DiscussionTitle />
                </Interaction.H1>
                <br />
                <ActionBar discussion={activeDiscussionId} fontSize />
                {!discussionContext?.discussion?.userCanComment && (
                  <DialogPaynote />
                )}
              </div>
              <Discussion />
            </>
          ) : (
            // Overview page
            <DialogOverviewPage />
          )}
        </div>
      </Center>
    </>
  )
}

const DialogPage = ({ serverContext }) => {
  const {
    query: { id },
  } = useRouter()

  return (
    <Frame
      hasOverviewNav
      raw
      formatColor='primary'
      // Only sticky if on /dialog without any query-params
      stickySecondaryNav={!id}
    >
      <MaybeDiscussionContextProvider discussionId={id}>
        <DialogContent activeDiscussionId={id} serverContext={serverContext} />
      </MaybeDiscussionContextProvider>
    </Frame>
  )
}

export default withDefaultSSR(DialogPage)
