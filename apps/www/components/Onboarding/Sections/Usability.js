import { Fragment } from 'react'
import { gql } from '@apollo/client'

import Section from '../Section'
import ProgressSettings from '../../Account/ProgressSettings'


import withT from '../../../lib/withT'


export const fragments = {
  user: gql`
    fragment UsabilityUser on User {
      id
      PROGRESS: hasConsentedTo(name: "PROGRESS_OPT_OUT")
    }
  `,
}

const Usability = (props) => {
  const { t } = props

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
