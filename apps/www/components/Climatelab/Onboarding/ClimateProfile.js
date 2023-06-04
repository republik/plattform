import { Component, Fragment } from 'react'
import { Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'

import { TESTIMONIAL_IMAGE_SIZE } from '../../constants'
import ErrorMessage from '../../ErrorMessage'
import Portrait from '../../Profile/Portrait'
import Section from '../../Onboarding/Section'
import { useTranslation } from '../../../lib/withT'

import {
  Interaction,
  Button,
  FieldSet,
  InlineSpinner,
  mediaQueries,
} from '@project-r/styleguide'

const { P } = Interaction

const PORTRAIT_SIZE_M = TESTIMONIAL_IMAGE_SIZE
const PORTRAIT_SIZE_S = TESTIMONIAL_IMAGE_SIZE * 0.75

const styles = {
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
    }
  `,
}

const climateProfileMutation = gql`
  mutation updateMe($firstName: String, $lastName: String, $portrait: String) {
    updateMe(firstName: $firstName, lastName: $lastName, portrait: $portrait) {
      id
      firstName
      lastName
    }
  }
`

class ClimateProfile extends Component {
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
    const { user, onContinue } = this.props
    const { values, errors, dirty } = this.state
    const { t } = useTranslation()

    const hasErrors = !!Object.keys(errors).filter((key) => !!errors[key])
      .length

    const mergedValues = Object.assign(
      {},
      user,
      { portrait: undefined },
      values,
    )

    const meFields = [
      {
        label: t('pledge/contact/firstName/label'),
        name: 'firstName',
        required: true,
        validator: (value) =>
          value.trim().length <= 0 && t('pledge/contact/firstName/error/empty'),
      },
      {
        label: t('pledge/contact/lastName/label'),
        name: 'lastName',
        required: true,
        validator: (value) =>
          value.trim().length <= 0 && t('pledge/contact/lastName/error/empty'),
      },
    ]

    return (
      <Section
        heading={t('Onboarding/Sections/Profile/heading')}
        showContinue={false}
        isTicked={user && user.hasPublicProfile}
        {...this.props}
      >
        <P {...styles.p}>
          {t('Onboarding/Sections/ClimateProfile/paragraph1', null, '')}
        </P>
        <P {...styles.p}>
          {t('Onboarding/Sections/ClimateProfile/paragraph2', null, '')}
        </P>
        <div {...merge(styles.portrait)}>
          <Portrait
            user={user}
            isEditing
            isMe
            values={mergedValues}
            errors={errors}
            dirty={dirty}
            onChange={this.onChange}
          />
        </div>
        <div {...styles.field}>
          <FieldSet
            values={mergedValues}
            errors={errors}
            dirty={dirty}
            onChange={this.onChange}
            fields={meFields}
          />
        </div>
        <Mutation
          mutation={climateProfileMutation}
          variables={values}
          onCompleted={this.onCompleted}
        >
          {(mutate, { loading, error }) => (
            <Fragment>
              <div {...styles.actions}>
                <div {...styles.save}>
                  {loading ? (
                    <InlineSpinner />
                  ) : (
                    <Button
                      primary
                      block
                      disabled={hasErrors || loading}
                      onClick={mutate}
                    >
                      {t('Onboarding/Sections/Profile/button/save', null, '')}
                    </Button>
                  )}
                </div>
                <div>
                  <Button block disabled={loading} onClick={onContinue}>
                    {t('Onboarding/Sections/Profile/button/continue', null, '')}
                  </Button>
                </div>
              </div>
              {!!error && <ErrorMessage error={error} />}
            </Fragment>
          )}
        </Mutation>
      </Section>
    )
  }
}

export default ClimateProfile
