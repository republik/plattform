import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import isEmail from 'validator/lib/isEmail'

import {
  Button,
  Label,
  InlineSpinner,
  Interaction,
  A,
  colors,
} from '@project-r/styleguide'

import ErrorMessage from '../../ErrorMessage'
import FieldSet from '../../FieldSet'
import withT from '../../../lib/withT'
import Link from 'next/link'

const { H3, P } = Interaction

class Form extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isMutating: false,
      mutationError: null,
      showErrors: false,
      values: {
        message: props.campaign.defaultMessage,
      },
      errors: {},
      dirty: {},
    }

    this.hasMutated = () => {
      this.setState({
        isMutating: false,
        values: {
          message: props.campaign.defaultMessage || '',
          email: '',
        },
      })
    }

    this.catchMutationError = (error) => {
      this.setState({
        isMutating: false,
        mutationError: error,
      })
    }

    this.grant = () => {
      this.setState({
        isMutating: true,
        mutationError: false,
      })

      return this.props
        .grantAccess({
          campaignId: this.props.campaign.id,
          email: this.state.values.email,
          message: this.state.values.message,
        })
        .then(this.hasMutated)
        .catch(this.catchMutationError)
    }
  }

  render() {
    const { campaign, givingMemberships, t } = this.props

    const { isMutating, mutationError, values, errors, dirty } = this.state

    const errorMessages = Object.keys(errors)
      .map((key) => errors[key])
      .filter(Boolean)

    const fields = [
      {
        name: 'email',
        type: 'email',
        label: t('Account/Access/Campaigns/Form/input/email/label'),
        validator: (email) =>
          (email.trim().length <= 0 &&
            t('Account/Access/Campaigns/Form/input/email/missing')) ||
          (!isEmail(email) &&
            t('Account/Access/Campaigns/Form/input/email/invalid')),
      },
      {
        name: 'message',
        type: 'text',
        label: t('Account/Access/Campaigns/Form/input/message/label'),
        validator: (message) =>
          message.trim().length > 500 &&
          t('Account/Access/Campaigns/Form/input/message/tooLong', {
            maxLength: 500,
          }),
        autoSize: true,
      },
    ]

    return (
      <form onSubmit={this.onSubmit}>
        {campaign.slots.total > 1 && campaign.slots.free < 1 ? (
          <Label>{t('Account/Access/Campaigns/Form/freeSlots/0')}</Label>
        ) : (
          <Fragment>
            <H3 style={{ marginTop: 30 }}>
              {t.pluralize(
                `Account/Access/Campaigns/Form${
                  givingMemberships ? '/givingMemberships' : ''
                }/title`,
                {
                  count: campaign.slots.used,
                },
              )}
            </H3>
            <P>
              {t.elements('Account/Access/Campaigns/Form/explanation', {
                linkClaim: (
                  <Link
                    key={`campaign-form-explanation-${campaign.id}`}
                    href={{
                      pathname: '/abholen',
                      query: { context: 'access' },
                    }}
                    passHref
                    legacyBehavior
                  >
                    <A>
                      {t('Account/Access/Campaigns/Form/explanation/linkClaim')}
                    </A>
                  </Link>
                ),
              })}
            </P>

            <FieldSet
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={(fields) => {
                this.setState(FieldSet.utils.mergeFields(fields))
              }}
              fields={fields}
            />
            {!!this.state.showErrors && errorMessages.length > 0 && (
              <div style={{ color: colors.error, marginBottom: 40 }}>
                {t('memberships/claim/error/title')}
                <br />
                <ul>
                  {errorMessages.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {isMutating ? (
              <InlineSpinner />
            ) : (
              <Button
                primary
                onClick={(event) => {
                  event.preventDefault()

                  if (errorMessages.length) {
                    this.setState((state) => ({
                      showErrors: true,
                      dirty: {
                        ...state.dirty,
                        email: true,
                        message: true,
                      },
                    }))
                    return
                  }

                  this.grant()
                }}
              >
                {t('Account/Access/Campaigns/Form/button/submit')}
              </Button>
            )}
            <br />
            {campaign.slots.free > 1 && campaign.slots.free < 10 && (
              <Label>
                {t.pluralize('Account/Access/Campaigns/Form/freeSlots', {
                  count: campaign.slots.free,
                })}
              </Label>
            )}
            {mutationError && (
              <div>
                <ErrorMessage error={mutationError} />
                <Label>
                  {t('Account/Access/Campaigns/Form/mutationError/hint')}
                </Label>
              </div>
            )}
          </Fragment>
        )}
      </form>
    )
  }
}

export default compose(withT)(Form)
