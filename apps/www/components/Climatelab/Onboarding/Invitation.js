import { Fragment } from 'react'
import { css } from 'glamor'

import { Interaction, mediaQueries } from '@project-r/styleguide'

import Section from '../../Onboarding/Section'

import { useTranslation } from '../../../lib/withT'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    '& > button': {
      flexGrow: 1,
      margin: '5px 15px 0 0',
      minWidth: '120px',
      [mediaQueries.mUp]: {
        flexGrow: 0,
        margin: '5px 15px 0 0',
        minWidth: '160px',
      },
    },
  }),
}

// export const fragments = {
//   user: gql``,
// }

const Invitation = (props) => {
  const { t } = useTranslation()

  // Is ticked when either???

  return (
    <Section
      heading={t('Climatelab/Onboarding/Invitation/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <Fragment>
        <P {...styles.p}>
          {t('Climatelab/Onboarding/Invitation/paragraph1', null, '')}
        </P>
      </Fragment>
    </Section>
  )
}

export default Invitation
