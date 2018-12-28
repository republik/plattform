import { Component, Fragment } from 'react'
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



const REACTIVATE_MEMBERSHIP = gql`
  mutation reactivateMembership($membershipId: ID!) {
    reactivateMembership(id: $membershipId) {
      id
    }
  }
`

export default class ReactivateMembership extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false
    }

    this.closeHandler = () => {
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

  render() {
    const { isOpen } = this.state
    const { refetchQueries } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          (Re)aktivieren
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={REACTIVATE_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(reactivateMembership, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar>
                    <OverlayToolbarClose
                      onClick={this.closeHandler}
                    />
                  </OverlayToolbar>
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>
                            Bist du dir sicher?
                          </Interaction.H2>
                          <br />
                          <Button
                            primary
                            onClick={this.submitHandler(
                              reactivateMembership
                            )}
                          >
                            Ja
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
      </div>
    )
  }
}
