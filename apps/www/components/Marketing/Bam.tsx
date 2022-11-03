import React from 'react'
import Lead from './Lead'
import { mediaQueries, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMe } from '../../lib/context/MeContext'
import MarketingHeader from './MarketingHeader'
import Carousel, { CarouselProps } from './Carousel'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'

const Bam: React.FC<CarouselProps> = (props) => {
  const { me } = useMe()
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.container}
      {...colorScheme.set('backgroundColor', 'default')}
    >
      {!me && <MarketingHeader />}
      <div {...styles.panelContainer}>
        <div {...styles.panel} {...styles.leadPanel}>
          <Lead />
        </div>
        <div
          {...styles.panel}
          style={{
            padding: 0,
            [mediaQueries.mUp]: {
              padding: '0 15px',
            },
          }}
        >
          <Carousel {...props} />
        </div>
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
  panelContainer: css({
    display: 'flex',
    flex: 1,
    maxWidth: 1280,
    flexDirection: 'column-reverse',
    justifyContent: 'flex-end',
    gap: 64,
    paddingTop: HEADER_HEIGHT_MOBILE,
    margin: '64px 0 90px 0',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: 32,
      margin: `120px auto ${HEADER_HEIGHT + 120}px auto`,
      padding: `${HEADER_HEIGHT}px 60px 0 60px`,
    },
    [mediaQueries.sDown]: {
      gap: 42,
      margin: '48px 0 64px 0',
    },
  }),
  panel: css({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 15px',
  }),
  leadPanel: css({
    [mediaQueries.mUp]: {
      maxWidth: 440,
    },
  }),
}

export default Bam
