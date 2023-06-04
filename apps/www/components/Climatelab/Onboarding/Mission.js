import { css } from 'glamor'

import { Interaction, mediaQueries, A } from '@project-r/styleguide'

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
        {t.elements('Climatelab/Onboarding/Mission/bullet1', {
          klimaheld: (
            <A href={t('Climatelab/Onboarding/Mission/bullet1/klimaheldHref')}>
              {t('Climatelab/Onboarding/Mission/bullet1/klimaheldText')}
            </A>
          ),
        })}
        <br /> <br />
        {t.elements('Climatelab/Onboarding/Mission/bullet2', {
          postcard: (
            <A href={t('Climatelab/Onboarding/Mission/bullet2/postcardHref')}>
              {t('Climatelab/Onboarding/Mission/bullet2/postcardText')}
            </A>
          ),
        })}
        <br /> <br />
        {t.elements('Climatelab/Onboarding/Mission/bullet3', {
          event: (
            <A href={t('Climatelab/Onboarding/Mission/bullet3/eventHref')}>
              {t('Climatelab/Onboarding/Mission/bullet3/eventText')}
            </A>
          ),
        })}
        <br />
      </P>
    </Section>
  )
}

export default Mission
