// import { WaveVisualization } from './Wave'
import { css, media, style } from 'glamor'
import Frame from '../../components/Frame'
import { fontStyles, mediaQueries, Editorial } from '@project-r/styleguide'
import NewsletterSignup from '../../components/Auth/NewsletterSignUp'
import { CDN_FRONTEND_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { useTranslation } from '../../lib/withT'
const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 48,
    maxWidth: 1280,
    margin: 0,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      marginTop: 48,
    },
  }),
}

const LandingPage = () => {
  const { t } = useTranslation()
  return (
    <Frame
      containerMaxWidth={1080}
      meta={{
        url: `${PUBLIC_BASE_URL}/hoeren`,
        pageTitle: `${t('marketing/readAloud/title')}`,
        title: `${t('marketing/readAloud/title')}`,
        description: `${t('marketing/readAloud/lead1')}`,
        image: `${CDN_FRONTEND_BASE_URL}/static/social-media/hoeren.png`,
      }}
    >
      <div {...styles.container}>
        <div style={{ flex: 1 }}>
          <img
            style={{ width: '100%', height: 'auto' }}
            src={`${CDN_FRONTEND_BASE_URL}/static/republik-zum-hoeren.png`}
            alt={t('marketing/readAloud/title')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Editorial.Headline>
            {t('marketing/readAloud/title')}
          </Editorial.Headline>
          <Editorial.Lead>{t('marketing/readAloud/lead1')}</Editorial.Lead>
          <br />
          <br />
          <Editorial.Lead>{t('marketing/readAloud/lead2')}</Editorial.Lead>
          <NewsletterSignup
            free
            name='READALOUD'
            buttonLabel='Benachrichtigen'
            skipTitle={true}
          />
        </div>
      </div>
    </Frame>
  )
}

export default LandingPage
