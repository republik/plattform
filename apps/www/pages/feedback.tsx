import Link from 'next/link'
import Frame from '../components/Frame'
import {
  CDN_FRONTEND_BASE_URL,
  GENERAL_FEEDBACK_DISCUSSION_ID,
  PUBLIC_BASE_URL,
} from '../lib/constants'
import DiscussionContextProvider from '../components/Discussion/context/DiscussionContextProvider'
import Discussion from '../components/Discussion/Discussion'
import { Center, Editorial, Interaction } from '@project-r/styleguide'
import { useTranslation } from '../lib/withT'
import ActionBar from '../components/ActionBar'
import { withDefaultSSR } from 'lib/apollo/helpers'
import Meta from 'components/Frame/Meta'

const FeedbackDialogPage = () => {
  const { t } = useTranslation()
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

        <DiscussionContextProvider discussionPath={'/feedback'}>
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
        </DiscussionContextProvider>
      </Frame>
    </>
  )
}

export default withDefaultSSR(FeedbackDialogPage)
