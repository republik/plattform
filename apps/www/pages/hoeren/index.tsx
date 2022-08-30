// import { WaveVisualization } from './Wave'
import { css, media, style } from 'glamor'
import Frame from '../../components/Frame'
import { fontStyles, mediaQueries } from '@project-r/styleguide'
import NewsletterSignup from '../../components/Auth/NewsletterSignUp'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'

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
  title: css({
    ...fontStyles.serifTitle58,
    marginTop: 0,
  }),
  lead: css({
    ...fontStyles.serifRegular25,
  }),
}

const LandingPage = () => (
  <Frame containerMaxWidth={1080} meta='meta'>
    <div {...styles.container}>
      <div style={{ flex: 1 }}>
        <img
          style={{ width: '100%', height: 'auto' }}
          src={`${CDN_FRONTEND_BASE_URL}/static/republik-zum-hoeren.png`}
          // height='54'
          alt='Republik zum hören'
        />
      </div>
      <div style={{ flex: 1 }}>
        <h1 {...styles.title}>Die Republik zum Hören.</h1>
        <p {...styles.lead}>
          Die Republik gibt es ab Herbst neu als digitales Audiomagazin,
          komplett zum hören. Herausragender Journalismus, vorgelesen von
          professionellen Sprecherinnen.
        </p>
        <p {...styles.lead}>Erfahren Sie als erstes, wenn es los geht</p>
        <NewsletterSignup
          free
          name='hoerthoert'
          buttonLabel='benachrichtigen'
        />
      </div>
    </div>
  </Frame>
)

export default LandingPage
