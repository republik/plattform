import { Fragment } from 'react'
import { css } from 'glamor'

import { Interaction, mediaQueries } from '@project-r/styleguide'

import Section from '../Section'

import withT from '../../../lib/withT'

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

const Mission = (props) => {
  const { t } = props

  // Is ticked when either???

  return (
    <Section
      heading={t('Onboarding/Sections/Mission/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <Fragment>
        <P {...styles.p}>
          {t('Onboarding/Sections/Mission/paragraph1', null, '')}
        </P>
      </Fragment>
    </Section>
  )
}

export default withT(Mission)
