import { css } from 'glamor'
import {
  Center,
  Editorial,
  inQuotes,
  Interaction,
  mediaQueries,
} from '@project-r/styleguide'
import Frame from '../../components/Frame'
import Link from 'next/link'
import { useTranslation } from '../../lib/withT'
import { useRouter } from 'next/router'
import Discussion from '../../components/Discussion/Discussion'
import DiscussionContextProvider from '../../components/Discussion/context/DiscussionContextProvider'
import { useDiscussion } from '../../components/Discussion/context/DiscussionContext'
import Meta from '../../components/Frame/Meta'
import StatusError from '../../components/StatusError'
import { DialogPaynote } from '@app/components/paynotes/paynotes-in-trial/dialog'
import DiscussionTitle from '../../components/Dialog/DiscussionTitle'
import ActionBar from '../../components/ActionBar'
import { PUBLIC_BASE_URL } from 'lib/constants'
import { withDefaultSSR } from 'lib/apollo/helpers'

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
            <ActionBar
              discussion={discussionContext?.discussion?.id}
              fontSize
            />
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

const DialogPage = () => {
  const router = useRouter()
  const { path } = router.query
  const discussionPath = '/' + [].concat(path || []).join('/')
  console.log('discussionPath', discussionPath)
  return (
    <Frame hasOverviewNav raw formatColor='primary' stickySecondaryNav={true}>
      <DiscussionContextProvider discussionPath={discussionPath}>
        <DialogContent />
      </DiscussionContextProvider>
    </Frame>
  )
}

export default withDefaultSSR(DialogPage)
