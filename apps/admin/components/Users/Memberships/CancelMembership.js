import { Component, Fragment } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import TextareaAutosize from 'react-autosize-textarea'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Interaction,
  Radio,
  Checkbox,
  Field,
  Loader,
} from '@project-r/styleguide'

import { TextButton, displayDate } from '../../Display/utils'

const GET_CANCELLATION_CATEGORIES = gql`
  query cancellationCategories {
    cancellationCategories(showMore: true) {
      type
      label
    }
  }
`

const CANCEL_MEMBERSHIP = gql`
  mutation cancelMembership(
    $membershipId: ID!
    $immediately: Boolean
    $details: CancellationInput!
  ) {
    cancelMembership(
      id: $membershipId
      immediately: $immediately
      details: $details
    ) {
      id
    }
  }
`

const UPDATE_CANCELLATION = gql`
  mutation updateMembershipCancellation(
    $cancellationId: ID!
    $details: CancellationInput!
  ) {
    updateMembershipCancellation(id: $cancellationId, details: $details) {
      id
    }
  }
`

export default class CancelPledge extends Component {
  constructor(props) {
    super(props)
    const { cancellation } = props
    this.state = {
      isOpen: false,
      immediately: false,
      suppressConfirmation: cancellation && cancellation.suppressConfirmation,
      suppressWinback: cancellation && cancellation.suppressWinback,
      reason: (cancellation && cancellation.reason) || '',
      cancellationType: (cancellation && cancellation.category.type) || '',
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

    this.submitHandler = (mutation) => () => {
      const {
        immediately,
        suppressConfirmation,
        suppressWinback,
        reason,
        cancellationType,
      } = this.state

      return mutation({
        variables: {
          ...(this.props.cancellation && {
            cancellationId: this.props.cancellation.id,
          }),
          ...(!this.props.cancellation && {
            membershipId: this.props.membership.id,
            immediately,
          }),
          details: {
            reason,
            type: cancellationType,
            suppressConfirmation,
            suppressWinback,
          },
        },
      }).then(() => this.setState(() => ({ isOpen: false })))
    }
  }

  render() {
    const { isOpen, reason, cancellationType } = this.state
    const { refetchQueries, membership, cancellation } = this.props
    const isEditing = !!cancellation
    return (
      <Fragment>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          {isEditing ? 'editieren' : 'künden'}
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={isEditing ? UPDATE_CANCELLATION : CANCEL_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(cancelPledge, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Query query={GET_CANCELLATION_CATEGORIES}>
                      {({
                        loading: queryLoading,
                        error: queryError,
                        data: queryData,
                      }) => {
                        const { cancellationCategories } = queryData || {}
                        return (
                          <Loader
                            loading={loading || queryLoading}
                            error={error || queryError}
                            render={() => (
                              <Fragment>
                                <Interaction.H2>
                                  {isEditing
                                    ? 'Kündigung editieren'
                                    : 'Membership canceln'}
                                </Interaction.H2>
                                <br />
                                <Interaction.P>
                                  #{membership.sequenceNumber} –{' '}
                                  {membership.type.name.split('_').join(' ')} –{' '}
                                  {displayDate(membership.createdAt)} –{' '}
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
                                  cancellationCategories.map(
                                    ({ type, label }) => (
                                      <Interaction.P key={type}>
                                        <Radio
                                          value={cancellationType}
                                          checked={cancellationType === type}
                                          onChange={() =>
                                            this.setState({
                                              cancellationType: type,
                                            })
                                          }
                                        >
                                          {label}
                                        </Radio>
                                      </Interaction.P>
                                    ),
                                  )}
                                <Field
                                  value={reason}
                                  label={'Erläuterungen'}
                                  onChange={this.reasonChangeHandler}
                                  renderInput={(props) => (
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
                                    disabled={isEditing}
                                  >
                                    Sofort canceln
                                  </Checkbox>
                                </p>
                                <p>
                                  <Checkbox
                                    checked={this.state.suppressConfirmation}
                                    onChange={
                                      this.suppressConfirmationChangeHandler
                                    }
                                    disabled={isEditing}
                                  >
                                    Kündigungsbestätigung unterdrücken
                                  </Checkbox>
                                </p>
                                <p>
                                  <Checkbox
                                    checked={this.state.suppressWinback}
                                    onChange={this.suppressWinbackChangeHandler}
                                    disabled={
                                      cancellation &&
                                      (cancellation.winbackSentAt ||
                                        !cancellation.winbackCanBeSent)
                                    }
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
                      }}
                    </Query>
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
