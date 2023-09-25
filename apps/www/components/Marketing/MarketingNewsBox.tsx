import {
  mediaQueries,
  useColorContext,
  FigureImage,
  fontStyles,
} from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import Link from 'next/link'

import { css } from 'glamor'
import NewsletterSignup from '../Auth/NewsletterSignUp'

const MarketingNewsBox = (me) => {
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.center}>
      <div
        {...styles.container}
        {...colorScheme.set('backgroundColor', 'overlay')}
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
            <Link
              href='/format/was-diese-woche-wichtig-war'
              style={{ textDecoration: 'none' }}
            >
              <h3 {...styles.heading}>Was diese Woche wichtig war</h3>
            </Link>
            <NewsletterSignup me={me} name='WDWWW' free smallButton />
          </div>
        </div>
        <span
          {...colorScheme.set('color', 'textInverted')}
          {...colorScheme.set('backgroundColor', 'text')}
          {...styles.new}
        >
          Neu
        </span>
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
      padding: 0,
    },
  }),
  container: css({
    position: 'relative',
    width: '100%',
    padding: '16px 16px 4px 16px',
    marginBottom: 24,
    borderRadius: 4,
    [mediaQueries.mUp]: {
      padding: '16px 18px 4px 14px',
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
    width: 72,
    height: 72,
    marginRight: 0,
    objectFit: 'cover',
    [mediaQueries.mUp]: {
      marginRight: 16,
    },
  }),
  heading: css({
    color: '#0A99B8 !important',
    margin: '12px 0px 4px',
    ...fontStyles.sansSerifMedium18,
    [mediaQueries.mUp]: {
      margin: '0px 0px 4px',
      ...fontStyles.sansSerifMedium22,
    },
  }),
  p: css({
    margin: '0px 0px 4px',
    ...fontStyles.sansSerifRegular14,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular16,
    },
  }),
  new: css({
    ...fontStyles.sansSerifMedium15,
    position: 'absolute',
    top: 15,
    right: 15,
    padding: '0px 6px',
    borderRadius: 2,
  }),
  [mediaQueries.mUp]: {
    top: 12,
  },
}

export default MarketingNewsBox
