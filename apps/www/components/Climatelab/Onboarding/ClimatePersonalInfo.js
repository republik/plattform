import React from 'react'
import { css } from 'glamor'

import { TESTIMONIAL_IMAGE_SIZE } from '../../constants'
import Section from '../../Onboarding/Section'
import withT from '../../../lib/withT'
import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'

import {
  Interaction,
  mediaQueries,
  convertStyleToRem,
  fontStyles,
} from '@project-r/styleguide'

const { P } = Interaction

const PORTRAIT_SIZE_M = TESTIMONIAL_IMAGE_SIZE
const PORTRAIT_SIZE_S = TESTIMONIAL_IMAGE_SIZE * 0.75

const styles = {
  questionnaireStyleOverride: css({
    '& h2': {
      ...convertStyleToRem(fontStyles.sansSerifRegular19),
      marginTop: '30px',
    },
    [mediaQueries.mUp]: {
      '& h2': {
        ...convertStyleToRem(fontStyles.sansSerifRegular22),
      },
    },
  }),
  p: css({
    marginBottom: 20,
  }),
  field: css({
    marginTop: 10,
    marginBottom: 10,
  }),
  checkbox: css({
    marginTop: 40,
    marginBottom: 40,
  }),
  portrait: css({
    width: PORTRAIT_SIZE_S,
    height: PORTRAIT_SIZE_S,
    [mediaQueries.mUp]: {
      width: PORTRAIT_SIZE_M,
      height: PORTRAIT_SIZE_M,
    },
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    '& > div': {
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
  save: css({
    width: 160,
    textAlign: 'center',
  }),
}

const ClimatePersonalInfo = (props) => {
  const { t } = props
  return (
    <Section
      heading={t('Climatelab/Onboarding/ClimatePersonalInfo/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <P {...styles.p}>
        {t('Climatelab/Onboarding/ClimatePersonalInfo/paragraph1', null, '')}
      </P>

      <div {...styles.questionnaireStyleOverride}>
        <QuestionnaireWithData
          slug={'klima-personalinfo'}
          publicSubmission={false}
          hideCount
          submittedMessage={
            <Interaction.P>
              {t('Climatelab/Onboarding/ClimatePersonalInfo/merci1')}
            </Interaction.P>
          }
          hideInvalid={true}
          hideReset={true}
        />
      </div>
    </Section>
  )
}

export default withT(ClimatePersonalInfo)
