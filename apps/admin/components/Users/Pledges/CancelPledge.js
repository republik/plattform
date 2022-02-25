import React, { Component, Fragment } from 'react'
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

import { TextButton } from '../../Display/utils'

const CANCEL_PLEDGE = gql`
  mutation cancelPledge($pledgeId: ID!) {
    cancelPledge(pledgeId: $pledgeId) {
      id
      status
    }
  }
`

export default class CancelPledge extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false }))
    }

    this.submitHandler = (mutation) => () => {
      return mutation({
        variables: {
          pledgeId: this.props.pledge.id,
        },
      }).then(() => this.setState(() => ({ isOpen: false })))
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
          Cancel
        </TextButton>

        {isOpen && (
          <Mutation mutation={CANCEL_PLEDGE} refetchQueries={refetchQueries}>
            {(cancelPledge, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>Bist du dir sicher?</Interaction.H2>
                          <br />
                          <Button
                            primary
                            onClick={this.submitHandler(cancelPledge)}
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
