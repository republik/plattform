import React from 'react'
import Lead from './Lead'
import {
  mediaQueries,
  colors,
  ColorContextProvider,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { useMe } from '../../lib/context/MeContext'
import MarketingHeader from './MarketingHeader'
import Carousel, { CarouselProps } from './Carousel'

const Bam: React.FC<CarouselProps> = (props) => {
  const { me } = useMe()
  return (
    <div {...styles.container}>
      {!me && (
        <ColorContextProvider colorSchemeKey='dark'>
          <MarketingHeader />
        </ColorContextProvider>
      )}
      <div {...styles.panelContainer}>
        <div {...styles.panel}>
          <Lead />
        </div>
        <div {...styles.panel}>
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
    backgroundColor: colors.dark.default,
    height: '100vh',
    position: 'relative',
  }),
  panelContainer: css({
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column-reverse',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  panel: css({
    flex: '0 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

export default Bam
