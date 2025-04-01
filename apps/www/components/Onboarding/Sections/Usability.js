import { Fragment } from 'react'

import Section from '../Section'
import ProgressSettings from '../../Account/ProgressSettings'
import withT from '../../../lib/withT'

const Usability = (props) => {
  const { user, t } = props

  return (
    <Section
      heading={t('Onboarding/Sections/Usability/heading')}
      showContinue
      {...props}
    >
        <Fragment>
          <ProgressSettings />
          <br />
        </Fragment>

    </Section>
  )
}

export default withT(Usability)
