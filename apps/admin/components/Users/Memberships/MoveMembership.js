import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { Component, Fragment } from 'react'

import { Interaction, Loader } from '@project-r/styleguide'

import { displayDateTime, TextButton } from '@/components/Display/utils'
import SearchUser from '@/components/Form/SearchUser'
import { Button, SimpleDialog } from '@republik/ui'

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
                <SimpleDialog
                  onOpenChange={(open) => {
                    if (!open) {
                      this.closeHandler()
                    }
                  }}
                >
                  <Loader
                    loading={loading}
                    error={error}
                    render={() => (
                      <Fragment>
                        <Interaction.H2>Membership verschieben</Interaction.H2>
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
                          disabled={!user}
                          onClick={this.submitHandler(movePledge)}
                        >
                          Speichern
                        </Button>
                      </Fragment>
                    )}
                  />
                </SimpleDialog>
              )
            }}
          </Mutation>
        )}
      </Fragment>
    )
  }
}
