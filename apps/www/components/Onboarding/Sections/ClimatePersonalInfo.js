import { Component, Fragment } from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'

import { TESTIMONIAL_IMAGE_SIZE } from '../../constants'
import ErrorMessage from '../../ErrorMessage'
import Portrait from '../../Profile/Portrait'
import { ListedCheckbox } from '../../Profile/Settings'
import { mutation } from '../../Profile/Edit'
import UsernameField from '../../Profile/UsernameField'
import Section from '../Section'
import withT from '../../../lib/withT'
import { QuestionnaireWithData } from '../../Questionnaire/Questionnaire'

import {
  Interaction,
  Button,
  FieldSet,
  InlineSpinner,
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

export const fragments = {
  user: gql`
    fragment ProfileUser on User {
      id
      firstName
      lastName
      portrait
      statement
      username
      isAdminUnlisted
      isListed
      isEligibleForProfile
      hasPublicProfile
    }
  `,
}

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      values: {},
      errors: {},
      dirty: {},
    }

    this.onChange = (fields) => {
      this.setState(FieldSet.utils.mergeFields(fields))
    }

    this.onCompleted = () => {
      props.onContinue.apply(null, [props])
    }
  }

  render() {
    const { user, onContinue, t } = this.props
    const { values, errors, dirty } = this.state

    const hasErrors = !!Object.keys(errors).filter((key) => !!errors[key])
      .length

    const mergedValues = Object.assign(
      {},
      user,
      { portrait: undefined },
      values,
    )

    return (
      <Section
        heading={t('Onboarding/Sections/ClimatePersonalInfo/heading')}
        showContinue={false}
        isTicked={user && user.hasPublicProfile}
        {...this.props}
      >
        <P {...styles.p}>
          {t('Onboarding/Sections/ClimatePersonalInfo/paragraph1', null, '')}
        </P>

        <div {...styles.questionnaireStyleOverride}>
          <QuestionnaireWithData
            slug={'klima-personalinfo'}
            publicSubmission={false}
            hideCount
            submittedMessage={
              <Interaction.P>
                {t('Onboarding/Sections/ClimatePersonalInfo/merci1')}
              </Interaction.P>
            }
            hideInvalid={true}
            hideReset={true}
          />
        </div>
      </Section>
    )
  }
}

export default withT(Profile)
