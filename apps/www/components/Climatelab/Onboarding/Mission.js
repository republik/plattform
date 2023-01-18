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

const Mission = (props) => {
  const { t } = useTranslation()

  return (
    <Section heading={t('Climatelab/Onboarding/Mission/heading')} {...props}>
      <P {...styles.p}>
        {t('Climatelab/Onboarding/Mission/paragraph1', null, '')}
        <br /> <br />
        {t('Climatelab/Onboarding/Mission/bullet1', null, '')}
        <br /> <br />
        {t('Climatelab/Onboarding/Mission/bullet2', null, '')}
        <br /> <br />
        {t('Climatelab/Onboarding/Mission/bullet3', null, '')}
        <br />
      </P>
    </Section>
  )
}

export default Mission
