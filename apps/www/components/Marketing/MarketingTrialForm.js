import React from 'react'
import { css } from 'glamor'

import {
  mediaQueries,
  Interaction,
  useColorContext,
  ColorContextProvider,
} from '@project-r/styleguide'
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'
import TrialForm from '../Trial/Form'

const MarketingTrialForm = ({ t }) => {
  const [colorScheme] = useColorContext()
  return (
    <div id='probelesen' {...styles.trialformsection}>
      <div
        style={{ width: '100%' }}
        {...colorScheme.set('backgroundColor', 'hover')}
      >
        <div {...styles.container}>
          <div>
            <h2 {...colorScheme.set('color', 'text')} {...styles.title}>
              {t('marketing/trial/button/label')}
            </h2>
            <Interaction.P>{t('marketing/trynote/cta')}</Interaction.P>
          </div>
          <div style={{ paddingTop: 20 }}>
            <TrialForm minimal />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  trialformsection: css({
    paddingTop: HEADER_HEIGHT_MOBILE,
    [mediaQueries.mUp]: {
      paddingTop: HEADER_HEIGHT,
    },
  }),
  container: css({
    padding: '15px 15px 30px 15px',
    display: 'flex',
    maxWidth: 600,
    margin: '0 auto',
    flexDirection: 'column',
  }),
}

const WrappedMarketingTrialForm = ({ ...props }) => (
  <ColorContextProvider colorSchemeKey='dark'>
    <MarketingTrialForm {...props} />
  </ColorContextProvider>
)

export default WrappedMarketingTrialForm
