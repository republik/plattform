import { gql } from '@apollo/client'
import Section from '../Section'
import ProgressSettings from '../../Account/ProgressSettings'

import { useTranslation } from '../../../lib/withT'

export const fragments = {
  user: gql`
    fragment UsabilityUser on User {
      id
      PROGRESS: hasConsentedTo(name: "PROGRESS_OPT_OUT")
    }
  `,
}

const Usability = (props) => {
  const { t } = useTranslation()

  return (
    <Section
      heading={t('Onboarding/Sections/Usability/heading')}
      showContinue
      {...props}
    >
        <ProgressSettings />
        <br />
    </Section>
  )
}

export default Usability
