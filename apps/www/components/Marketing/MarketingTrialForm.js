import { css } from 'glamor'

import {
  mediaQueries,
  Interaction,
  useColorContext,
  ColorContextProvider,
} from '@project-r/styleguide'
import { HEADER_HEIGHT } from '../constants'
import TrialForm from '../Trial/Form'
import { useTranslation } from '../../lib/withT'

const MarketingTrialForm = () => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
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
    paddingTop: HEADER_HEIGHT,
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
