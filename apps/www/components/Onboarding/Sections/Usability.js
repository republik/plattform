import Section from '../Section'
import ProgressSettings from '../../Account/ProgressSettings'

import { useTranslation } from '../../../lib/withT'

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
