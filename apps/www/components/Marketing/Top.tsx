import React from 'react'
import Lead from './Lead'
import { mediaQueries, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMe } from '../../lib/context/MeContext'
import MarketingHeader from './MarketingHeader'
import MarketingNewsBox from './MarketingNewsBox'
import Carousel, { CarouselProps } from './Carousel'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'

const Top: React.FC<CarouselProps> = (props) => {
  const { me } = useMe()
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.container}
      {...colorScheme.set('backgroundColor', 'default')}
    >
      {!me && <MarketingHeader />}
      <div {...styles.center}>
        <div {...styles.panelContainer}>
          <div {...styles.panel} {...styles.leadPanel}>
            <Lead />
          </div>
          <div
            {...styles.panel}
            {...css({
              padding: 0,
              [mediaQueries.mUp]: {
                padding: '0 15px',
              },
            })}
          >
            <Carousel {...props} />
          </div>
        </div>
      </div>
      <MarketingNewsBox me={me} />
    </div>
  )
}

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 400,
    [mediaQueries.mUp]: {
      minHeight: 500,
    },
  }),
  center: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [mediaQueries.mUp]: {
      padding: '0 60px',
    },
  }),
  panelContainer: css({
    display: 'flex',
    width: '100%',
    maxWidth: 1280,
    flexDirection: 'column-reverse',
    justifyContent: 'flex-end',
    gap: 64,
    paddingTop: HEADER_HEIGHT_MOBILE,
    margin: '64px 0 40px 0',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: 32,
      margin: `120px 0 ${HEADER_HEIGHT + 30}px 0`,
    },
    [mediaQueries.sDown]: {
      gap: 36,
      margin: '48px 0 64px 0',
    },
  }),
  panel: css({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  leadPanel: css({
    [mediaQueries.mUp]: {
      maxWidth: 400,
    },
  }),
}

export default Top
