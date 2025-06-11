import Link from 'next/link'
import Frame from '../components/Frame'
import { GENERAL_FEEDBACK_DISCUSSION_ID } from '../lib/constants'
import { MaybeDiscussionContextProvider } from '../pages/dialog'
import Discussion from '../components/Discussion/Discussion'
import { Center, Editorial, Interaction } from '@project-r/styleguide'
import { useTranslation } from '../lib/withT'
import ActionBar from '../components/ActionBar'
import { withDefaultSSR } from 'lib/apollo/helpers'

const FeedbackDialogPage = () => {
  const { t } = useTranslation()
  const activeDiscussionId = GENERAL_FEEDBACK_DISCUSSION_ID

  return (
    <>
      <Frame hasOverviewNav raw formatColor='primary'>
        <MaybeDiscussionContextProvider discussionId={activeDiscussionId}>
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
              <ActionBar discussion={activeDiscussionId} fontSize />
            </div>
            <Discussion />
          </Center>
        </MaybeDiscussionContextProvider>
      </Frame>
    </>
  )
}

export default withDefaultSSR(FeedbackDialogPage)