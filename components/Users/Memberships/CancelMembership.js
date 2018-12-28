import { Component, Fragment } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import TextareaAutosize from 'react-autosize-textarea'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Radio,
  Checkbox,
  Field,
  Loader
} from '@project-r/styleguide'

import {
  TextButton,
  displayDate
} from '../../Display/utils'

const GET_CANCELLATION_CATEGORIES = gql`
query cancellationCategories {
  cancellationCategories {
    type
    label
  }
}`


const CANCEL_MEMBERSHIP = gql`
mutation cancelMembership(
  $membershipId: ID!
  $immediately: Boolean
  $details: CancellationInput!
  $suppressNotifications: Boolean
) {
  cancelMembership(
    id: $membershipId
    immediately: $immediately
    details: $details
    suppressNotifications: $suppressNotifications
  ) {
    id
  }
}
`

export default class CancelPledge extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      immediately: false,
      suppressNotifications: false,
      reason: '',
      cancellationType: ''
    }

    this.reasonChangeHandler = (_, value) => {
      this.setState(() => ({ reason: value }))
    }

    this.immediatelyChangeHandler = (_, value) => {
      this.setState(() => ({ immediately: value }))
    }

    this.suppressNotificationsChangeHandler = (_, value) => {
      this.setState(() => ({ suppressNotifications: value }))
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = mutation => () => {
      const {
        immediately,
        suppressNotifications,
        reason,
        cancellationType
      } = this.state

      return mutation({
        variables: {
          membershipId: this.props.membership.id,
          immediately,
          suppressNotifications,
          details: {
            reason,
            type: cancellationType
          }
        }
      }).then(() =>
        this.setState(() => ({ isOpen: false }))
      )
    }
  }

  render() {
    const { isOpen, reason, cancellationType } = this.state
    const { refetchQueries, membership } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Cancel
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={CANCEL_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(cancelPledge, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar>
                    <OverlayToolbarClose
                      onClick={this.closeHandler}
                    />
                  </OverlayToolbar>
                  <OverlayBody>
                    <Query query={GET_CANCELLATION_CATEGORIES}>{({ loading: queryLoading, error: queryError, data: queryData}) => {
                      const { cancellationCategories } = queryData || {}
                      return (
                        <Loader
                          loading={loading || queryLoading}
                          error={error || queryError}
                          render={() => (
                            <Fragment>
                              <Interaction.H2>
                                Membership canceln
                              </Interaction.H2>
                              <br />
                              <Interaction.P>
                                #{membership.sequenceNumber} –{' '}
                                {membership.type.name.split('_').join(' ')}{' '}
                                –{' '}
                                {displayDate(membership.createdAt)}{' '}
                                –{' '}
                                {(!!membership.renew && 'ACTIVE') ||
                                'INACTIVE'}
                              </Interaction.P>
                              {membership.periods.map((period, i) => (
                                <span key={`period-${i}`}>
                                {displayDate(period.beginDate)}
                                {' - '}
                                {displayDate(period.endDate)}
                                </span>
                              ))}
                              <br />
                              {cancellationCategories &&
                                cancellationCategories.map(({ type, label }) => (
                                  <Interaction.P key={type}>
                                    <Radio
                                      value={cancellationType}
                                      checked={cancellationType === type}
                                      onChange={() => this.setState({ cancellationType: type })}
                                    >
                                      {label}
                                    </Radio>
                                  </Interaction.P>)
                                )}
                                <Field
                                  value={reason}
                                  label={'Grund'}
                                  onChange={this.reasonChangeHandler}
                                  renderInput={props => (
                                    <TextareaAutosize
                                    {...props}
                                    style={{ lineHeight: '30px' }}
                                    />
                                  )}
                                />
                                <p>
                                  <Checkbox
                                    checked={this.state.immediately}
                                    onChange={this.immediatelyChangeHandler}
                                  >
                                    Sofort canceln
                                  </Checkbox>
                                </p>
                                <p>
                                  <Checkbox
                                    checked={this.state.suppressNotifications}
                                    onChange={this.suppressNotificationsChangeHandler}
                                  >
                                    Benachrichtigungen unterdrücken
                                  </Checkbox>
                                </p>
                                <Button
                                  primary
                                  disabled={!cancellationType}
                                  onClick={this.submitHandler(cancelPledge)}
                                >
                                  Speichern
                                </Button>
                              </Fragment>
                            )}
                        />
                      )
                    }}</Query>
                  </OverlayBody>
                </Overlay>
              )
            }}
          </Mutation>
        )}
      </div>
    )
  }
}
