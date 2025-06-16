import { createGetServerSideProps } from '../../../lib/apollo/helpers'
import { css } from 'glamor'
import {
  Center,
  Editorial,
  inQuotes,
  Interaction,
  mediaQueries,
} from '@project-r/styleguide'
import Frame from '../../../components/Frame'
import Link from 'next/link'
import { useTranslation } from '../../../lib/withT'
import { useRouter } from 'next/router'
import Discussion from '../../../components/Discussion/Discussion'
import DiscussionContextProvider from '../../../components/Discussion/context/DiscussionContextProvider'
import { useDiscussion } from '../../../components/Discussion/context/DiscussionContext'
import Meta from '../../../components/Frame/Meta'
import StatusError from '../../../components/StatusError'
import { DialogPaynote } from '@app/components/paynotes/paynotes-in-trial/dialog'
import DiscussionTitle from '../../../components/Dialog/DiscussionTitle'
import ActionBar from '../../../components/ActionBar'
import { gql } from '@apollo/client'
import { PUBLIC_BASE_URL } from 'lib/constants'

const styles = {
  container: css({
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 25,
    },
  }),
}

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
  const metaData = discussionContext?.discussion &&
    !query.focus && {
      title: t('discussion/meta/title', {
        quotedDiscussionTitle: inQuotes(discussionContext.discussion.title),
      }),
      url: `${PUBLIC_BASE_URL}/dialog${discussionContext.discussion.path}`,
    }

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
            <br />
            <ActionBar discussion={activeDiscussionId} fontSize />
            {!discussionContext?.discussion?.userCanComment && (
              <DialogPaynote />
            )}
          </div>
          <Discussion />
        </div>
      </Center>
    </>
  )
}

const DialogPage = ({ serverContext, discussionId }) => {
  return (
    <Frame
      hasOverviewNav
      raw
      formatColor='primary'
      stickySecondaryNav={true}
    >
      <MaybeDiscussionContextProvider discussionId={discussionId}>
        <DialogContent
          activeDiscussionId={discussionId}
          serverContext={serverContext}
        />
      </MaybeDiscussionContextProvider>
    </Frame>
  )
}

export default DialogPage

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx, user }) => {
    const path = '/' + [].concat(ctx.params.path).join('/')

    const {
      data: { discussion },
    } = await client.query({
      query: gql`
        query getDiscussionId($path: String!) {
          discussion(path: $path) {
            id
          }
        }
      `,
      variables: {
        path,
      },
      // Ignore graphQLErrors and let the client handle/report them.
      errorPolicy: 'ignore',
    })

    if (!discussion) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        discussionId: discussion.id,
      },
    }
  },
)
