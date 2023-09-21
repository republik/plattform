import {
  mediaQueries,
  Center,
  useColorContext,
  Interaction,
  FigureImage,
} from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'

import { css } from 'glamor'
import NewsletterSignup from '../Auth/NewsletterSignUp'

const MarketingNewsBox = (me) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.center}>
      <div
        {...styles.container}
        {...colorScheme.set('backgroundColor', 'hover')}
        {...colorScheme.set('boxShadow', 'overlayShadow')}
      >
        <div {...styles.content}>
          <div {...styles.image}>
            <FigureImage
              {...FigureImage.utils.getResizedSrcs(
                `${CDN_FRONTEND_BASE_URL}/static/marketing/briefings.png?size=933x933`,
                undefined,
                100,
              )}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Interaction.H2 {...styles.heading}>
              Was diese Woche wichtig war
            </Interaction.H2>
            <Interaction.P {...styles.p}>
              Das Nachrichtenbriefing der Republik als Newlsetter. Jeden Freitag
              gratis in ihrem Postfach.
            </Interaction.P>
            <NewsletterSignup
              me={me}
              name='WDWWW'
              free
              skipTitle
              skipDescription
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0 15px',
    [mediaQueries.mUp]: {
      padding: '0 60px',
    },
  }),
  container: css({
    padding: '16px 16px 4px 16px',
    marginBottom: 24,
    [mediaQueries.mUp]: {
      padding: '16px 24px 4px 16px',
    },
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  image: css({
    width: 100,
    height: 100,
    marginRight: 0,
    objectFit: 'cover',
    [mediaQueries.mUp]: {
      marginRight: 36,
    },
  }),
  heading: css({
    color: '#0A99B8 !important',
    marginBottom: 4,
  }),
  p: css({
    marginBottom: 8,
    [mediaQueries.mUp]: {
      marginBottom: 4,
    },
  }),
}

export default MarketingNewsBox
