import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { Component, Fragment } from 'react'

import { Interaction, Loader } from '@project-r/styleguide'

import { TextButton } from '@/components/Display/utils'
import { Button, SimpleDialog } from '@republik/ui'

const ACTIVATE_MEMBERSHIP = gql`
  mutation activateMembership($membershipId: ID!) {
    activateMembership(id: $membershipId) {
      id
    }
  }
`

export default class ActivateMembership extends Component {
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
          membershipId: this.props.membership.id,
        },
      }).then(() => this.setState(() => ({ isOpen: false })))
    }
  }

  render() {
    const { isOpen } = this.state
    const { refetchQueries } = this.props

    return (
      <Fragment>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          aktivieren
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={ACTIVATE_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(activateMembership, { loading, error }) => {
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
                        <Interaction.H2>Bist du dir sicher?</Interaction.H2>
                        <br />
                        <Button
                          onClick={this.submitHandler(activateMembership)}
                        >
                          Ja
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
