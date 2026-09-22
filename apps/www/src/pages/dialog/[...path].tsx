import { DiscussionNotificationOption } from '#graphql/republik-api/__generated__/gql/graphql'
import FollowDiscussionDropdown from '@/app/(sanity)/components/follow/follow-discussion-dropdown'
import { DialogPaynote } from '@/app/(sanity)/components/paynotes/paynotes-in-trial/dialog'
import ActionBar from '@/components/ActionBar/Discussion'
import DiscussionTitle from '@/components/Dialog/DiscussionTitle'
import { useDiscussion } from '@/components/Discussion/context/DiscussionContext'
import DiscussionContextProvider from '@/components/Discussion/context/DiscussionContextProvider'
import Discussion from '@/components/Discussion/Discussion'
import Frame from '@/components/Frame'
import Meta from '@/components/Frame/Meta'
import StatusError from '@/components/StatusError'
import { prefetchDiscussion } from '@/components/Discussion/graphql/prefetchDiscussion'
import {
  createGetServerSideProps,
  providedUserAgentProps,
} from '@/lib/apollo/helpers'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import { getServerSideRedirection } from '@/lib/redirections'
import { useTranslation } from '@/lib/withT'
import {
  Center,
  Editorial,
  inQuotes,
  Interaction,
  mediaQueries,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'

const styles = {
  container: css({
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 25,
    },
  }),
}

const DialogContent = () => {
  const { t } = useTranslation()
  const discussionContext = useDiscussion()

  if (
    discussionContext &&
    !discussionContext.loading &&
    !discussionContext.error &&
    !discussionContext.discussion
  ) {
    return <StatusError statusCode={404} />
  }
  // wait for loaded discussion object and skip if focus comment, handled by the provider
  const metaData = discussionContext?.discussion && {
    title: t('discussion/meta/title', {
      quotedDiscussionTitle: inQuotes(discussionContext.discussion.title),
    }),
    url: `${PUBLIC_BASE_URL}/dialog${discussionContext.discussion.path}`,
  }

  const isLoaded = !discussionContext.loading && !discussionContext.error

  return (
    <>
      {metaData && <Meta data={metaData} />}
      <Center>
        <div {...styles.container}>
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
            {isLoaded && !discussionContext?.discussion?.userCanComment && (
              <div style={{ marginTop: 30 }}>
                <DialogPaynote />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'center',
                marginTop: 30,
              }}
            >
              <FollowDiscussionDropdown
                discussionId={discussionContext?.discussion?.id}
                notificationOption={
                  discussionContext?.discussion?.userPreference
                    ?.notifications as DiscussionNotificationOption
                }
              />
              <ActionBar />
            </div>
          </div>
          <Discussion />
        </div>
      </Center>
    </>
  )
}

const getDiscussionPath = (path: string | string[]): string =>
  '/' + (Array.isArray(path) ? path : [path]).filter(Boolean).join('/')

const DialogPage = () => {
  const router = useRouter()
  const discussionPath = getDiscussionPath(router.query.path)

  return (
    <Frame hasOverviewNav raw formatColor='primary' stickySecondaryNav={true}>
      <DiscussionContextProvider discussionPath={discussionPath}>
        <DialogContent />
      </DiscussionContextProvider>
    </Frame>
  )
}

export default DialogPage

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx }) => {
    const data = await prefetchDiscussion(client, {
      query: ctx.query,
      discussionPath: getDiscussionPath(ctx.params?.path),
    })

    // Only a loaded-but-empty result means the discussion is gone. If the
    // prefetch itself failed we render the page and let the client retry.
    if (data && !data.discussion) {
      const redirection = await getServerSideRedirection(client, ctx)

      if (redirection.type === 'redirect') {
        return { redirect: redirection.redirect }
      }

      if (redirection.type === 'none') {
        // `DialogContent` renders the 404 screen, this gives it the matching
        // status code — which `StatusError` used to set through `serverContext`
        ctx.res.statusCode = 404
      }
    }

    return { props: providedUserAgentProps(ctx.req) }
  },
)
