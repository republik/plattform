import { mediaQueries, useColorContext } from '@project-r/styleguide'
import MarketingNewsBox from 'components/Marketing/MarketingNewsBox'
import { css } from 'glamor'
import React from 'react'
import { useMe } from '../../lib/context/MeContext'
import { HEADER_HEIGHT } from '../constants'
import Carousel, { CarouselProps } from './Carousel'
import Lead from './Lead'
import MarketingHeader from './MarketingHeader'

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
        <MarketingNewsBox me={me} />
      </div>
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
      padding: '0 60px 24px',
    },
  }),
  panelContainer: css({
    display: 'flex',
    width: '100%',
    maxWidth: 1280,
    flexDirection: 'column-reverse',
    justifyContent: 'flex-end',
    gap: 64,
    paddingTop: HEADER_HEIGHT,
    margin: '64px 0 40px 0',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: 32,
      margin: `90px 0 ${HEADER_HEIGHT}px 0`,
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
