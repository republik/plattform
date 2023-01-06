import { css } from 'glamor'

import Section from '../../Onboarding/Section'
import { useTranslation } from '../../../lib/withT'
import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'
import { gql } from '@apollo/client'

import {
  Interaction,
  mediaQueries,
  convertStyleToRem,
  fontStyles,
  Button,
} from '@project-r/styleguide'

const { P } = Interaction

const styles = {
  questionnaireStyleOverride: css({
    '& h2': {
      ...convertStyleToRem(fontStyles.sansSerifRegular17),
      marginTop: '20px',
    },
    [mediaQueries.mUp]: {
      '& h2': {
        ...convertStyleToRem(fontStyles.sansSerifRegular21),
      },
    },
  }),
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    width: 160,
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

export const fragments = {
  climatepersonalinfo: gql`
    fragment ClimatePersonalInfo on queries {
      climatepersonalinfo: questionnaire(slug: "klima-personalinfo") {
        userHasSubmitted
      }
    }
  `,
}

const ClimatePersonalInfo = (props) => {
  const { climatepersonalinfo, onContinue } = props
  const { t } = useTranslation()
  return (
    <Section
      heading={t('Climatelab/Onboarding/ClimatePersonalInfo/heading')}
      isTicked={climatepersonalinfo.userHasSubmitted}
      showContinue={climatepersonalinfo.userHasSubmitted}
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
          context='climatepersonalinfo'
          requireName={false}
        />
        {!climatepersonalinfo.userHasSubmitted && (
          <div {...styles.actions}>
            <Button block onClick={onContinue}>
              {t('Onboarding/Sections/Profile/button/continue', null, '')}
            </Button>
          </div>
        )}
      </div>
    </Section>
  )
}

export default ClimatePersonalInfo
