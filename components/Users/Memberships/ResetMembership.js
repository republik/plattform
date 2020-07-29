import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  Loader
} from '@project-r/styleguide'

import {
  TextButton
} from '../../Display/utils'

const RESET_MEMBERSHIP = gql`
  mutation resetMembership($membershipId: ID!) {
    resetMembership(id: $membershipId) {
      id
    }
  }
`

export default class ResetMembership extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }

    this.handleClose = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = mutation => () => {
      return mutation({
        variables: {
          membershipId: this.props.membership.id
        }
      }).then(() =>
        this.setState(() => ({ isOpen: false }))
      )
    }
  }

  render () {
    const { isOpen } = this.state
    const { refetchQueries } = this.props
    return (
      <>
        <TextButton
          onClick={() => { this.setState({ isOpen: true }) }}
        >
          zurücksetzen
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={RESET_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(resetMembership, { loading, error }) => {
              return (
                <Overlay onClose={this.handleClose}>
                  <OverlayToolbar>
                    <OverlayToolbarClose onClick={this.handleClose} />
                  </OverlayToolbar>
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <>
                          <Interaction.H2>
                            Mitgliedschaft tatsächlich zurücksetzen?
                          </Interaction.H2>
                          <Interaction.P>
                            Durch das Zurücksetzen einer Mitliedschaft wird sie deaktivert, Perioden
                            entfernt und an den Pledger zurückgegeben. Sie kann daraufhin wieder aktiviert
                            oder eingelöst werden.
                          </Interaction.P>
                          <br />
                          <Button
                            primary
                            onClick={this.submitHandler(resetMembership)}
                          >
                            Ja
                          </Button>
                        </>
                      )}
                    />
                  </OverlayBody>
                </Overlay>
              )
            }}
          </Mutation>
        )}
      </>
    )
  }
}
