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
  cancellationCategories(showMore: true) {
    type
    label
  }
}`


const CANCEL_MEMBERSHIP = gql`
mutation cancelMembership(
  $membershipId: ID!
  $immediately: Boolean
  $details: CancellationInput!
  $suppressConfirmation: Boolean
  $suppressWinback: Boolean
) {
  cancelMembership(
    id: $membershipId
    immediately: $immediately
    details: $details
    suppressConfirmation: $suppressConfirmation
    suppressWinback: $suppressWinback
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
      suppressConfirmation: false,
      suppressWinback: false,
      reason: '',
      cancellationType: ''
    }

    this.reasonChangeHandler = (_, value) => {
      this.setState(() => ({ reason: value }))
    }

    this.immediatelyChangeHandler = (_, value) => {
      this.setState(() => ({ immediately: value }))
    }

    this.suppressConfirmationChangeHandler = (_, value) => {
      this.setState(() => ({ suppressConfirmation: value }))
    }

    this.suppressWinbackChangeHandler = (_, value) => {
      this.setState(() => ({ suppressWinback: value }))
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = mutation => () => {
      const {
        immediately,
        suppressConfirmation,
        suppressWinback,
        reason,
        cancellationType
      } = this.state

      return mutation({
        variables: {
          membershipId: this.props.membership.id,
          immediately,
          suppressConfirmation,
          suppressWinback,
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
      <Fragment>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          künden
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
                                  label={'Erläuterungen'}
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
                                    checked={this.state.suppressConfirmation}
                                    onChange={this.suppressConfirmationChangeHandler}
                                  >
                                    Kündigungsbestätigung unterdrücken
                                  </Checkbox>
                                </p>
                                <p>
                                  <Checkbox
                                    checked={this.state.suppressWinback}
                                    onChange={this.suppressWinbackChangeHandler}
                                  >
                                    Winback unterdrücken
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
      </Fragment>
    )
  }
}
