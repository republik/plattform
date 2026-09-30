import ActionBar from '@/components/ActionBar/Discussion'
import { UnauthorizedMessage } from '@/components/Auth/withMembership'
import { PageCenter } from '@/components/Auth/withAuthorization'
import DiscussionContextProvider from '@/components/Discussion/context/DiscussionContextProvider'
import Discussion from '@/components/Discussion/Discussion'
import { isDiscussionBlockedFor } from '@/components/Discussion/membersOnlyDiscussions'
import Frame from '@/components/Frame'
import Meta from '@/components/Frame/Meta'
import { prefetchDiscussion } from '@/components/Discussion/graphql/prefetchDiscussion'
import {
  createGetServerSideProps,
  providedUserAgentProps,
} from '@/lib/apollo/helpers'
import {
  CDN_FRONTEND_BASE_URL,
  GENERAL_FEEDBACK_DISCUSSION_ID,
  PUBLIC_BASE_URL,
} from '@/lib/constants'
import { useMe } from '@/lib/context/MeContext'
import { useTranslation } from '@/lib/withT'
import { Center, Editorial, Interaction } from '@project-r/styleguide'
import Link from '@/app/components/ui/link'

const DISCUSSION_PATH = '/feedback'

const FeedbackDialogPage = () => {
  const { t } = useTranslation()
  const { me } = useMe()
  const activeDiscussionId = GENERAL_FEEDBACK_DISCUSSION_ID

  const metaData = {
    title: t('feedback/title'),
    description: t('feedback/general/lead'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}/feedback`,
  }

  return (
    <>
      <Frame hasOverviewNav raw formatColor='primary'>
        <Meta data={metaData} />

        {isDiscussionBlockedFor(DISCUSSION_PATH, me) ? (
          <PageCenter>
            <UnauthorizedMessage />
          </PageCenter>
        ) : (
          <DiscussionContextProvider discussionPath={DISCUSSION_PATH}>
            <Center>
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
                <Interaction.H1>{t('feedback/general/title')}</Interaction.H1>
                <Interaction.P style={{ marginTop: 10 }}>
                  {t('feedback/general/lead')}
                </Interaction.P>
                <br />
                <ActionBar />
              </div>
              <Discussion />
            </Center>
          </DiscussionContextProvider>
        )}
      </Frame>
    </>
  )
}

export default FeedbackDialogPage

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx, user }) => {
    if (isDiscussionBlockedFor(DISCUSSION_PATH, user)) {
      return { props: providedUserAgentProps(ctx.req) }
    }

    await prefetchDiscussion(client, {
      query: ctx.query,
      discussionPath: DISCUSSION_PATH,
    })

    return { props: providedUserAgentProps(ctx.req) }
  },
)
