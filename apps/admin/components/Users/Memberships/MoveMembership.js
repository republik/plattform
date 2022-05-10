import { Component, Fragment } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Interaction,
  Loader,
} from '@project-r/styleguide'

import SearchUser from '../../Form/SearchUser'
import { displayDateTime, TextButton } from '../../Display/utils'

const MOVE_MEMBERSHIP = gql`
  mutation moveMembership($membershipId: ID!, $userId: ID!) {
    moveMembership(membershipId: $membershipId, userId: $userId) {
      id
    }
  }
`

export default class MoveMembership extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      user: null,
    }

    this.userChangeHandler = ({ value }) => {
      this.setState(() => ({ user: value }))
    }

    this.closeHandler = () => {
      this.setState(() => ({ user: null, isOpen: false }))
    }

    this.submitHandler = (mutation) => () => {
      return mutation({
        variables: {
          membershipId: this.props.membership.id,
          userId: this.state.user.id,
        },
      }).then(() => this.setState(() => ({ user: null, isOpen: false })))
    }
  }

  render() {
    const { isOpen, user } = this.state
    const { membership, refetchQueries } = this.props
    return (
      <Fragment>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          verschieben
        </TextButton>

        {isOpen && (
          <Mutation mutation={MOVE_MEMBERSHIP} refetchQueries={refetchQueries}>
            {(movePledge, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>
                            Membership verschieben
                          </Interaction.H2>
                          <br />
                          <Interaction.P>
                            #{membership.sequenceNumber} –{' '}
                            {membership.type.name.split('_').join(' ')} –{' '}
                            {displayDateTime(membership.createdAt)} –{' '}
                            {(!!membership.renew && 'ACTIVE') || 'INACTIVE'}
                          </Interaction.P>
                          {membership.periods.map((period, i) => (
                            <span key={`period-${i}`}>
                              {displayDateTime(period.beginDate)}
                              {' - '}
                              {displayDateTime(period.endDate)}
                            </span>
                          ))}
                          <SearchUser
                            label='User auswählen'
                            value={user}
                            onChange={this.userChangeHandler}
                          />
                          <Button
                            primary
                            disabled={!user}
                            onClick={this.submitHandler(movePledge)}
                          >
                            Speichern
                          </Button>
                        </Fragment>
                      )}
                    />
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
