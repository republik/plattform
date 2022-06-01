import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { css } from 'glamor'
import {
  Loader,
  LazyLoad,
  Editorial,
  mediaQueries,
} from '@project-r/styleguide'

import TeaserBlock, { GAP } from '../Overview/TeaserBlock'
import { getTeasersFromDocument } from '../Overview/utils'
import { useTranslation } from '../../lib/withT'

const Carpet = ({ loading, front }) => {
  const [highlight, setHighlight] = useState()
  const [isMobile, setIsMobile] = useState()
  const { t } = useTranslation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < mediaQueries.mBreakPoint)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // ensure the highlighFunction is not dedected as an state update function
  const onHighlight = (highlighFunction) => setHighlight(() => highlighFunction)
  return (
    <LazyLoad offset={1}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 50,
            zIndex: 2,
            width: '100%',
            height: 150,
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0))',
          }}
        />
        <Loader
          loading={loading}
          render={() => (
            <div
              style={{
                opacity: 0.6,
                maxWidth: 1600,
                margin: '0 auto',
                padding: `0 ${GAP}px`,
              }}
            >
              <TeaserBlock
                teasers={getTeasersFromDocument(front)}
                highlight={highlight}
                onHighlight={onHighlight}
                maxHeight={isMobile ? 300 : 450}
                maxColumns={8}
                noHover
                style={{ marginTop: 0, marginBottom: 0 }}
              />
            </div>
          )}
        />
        <div {...styles.center}>
          <Editorial.Lead>{t('marketing/page/carpet/text')}</Editorial.Lead>
        </div>
      </div>
    </LazyLoad>
  )
}

const styles = {
  center: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 15px',
    marginTop: '4em',
    [mediaQueries.mUp]: { marginTop: '4em' },
  }),
}

export default Carpet
