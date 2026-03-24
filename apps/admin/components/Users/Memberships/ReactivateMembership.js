import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { Component, Fragment } from 'react'

import { Interaction, Loader } from '@project-r/styleguide'

import { TextButton } from '@/components/Display/utils'
import { Button, SimpleDialog } from '@republik/ui'

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
          (re)aktivieren
        </TextButton>

        {isOpen && (
          <Mutation
            mutation={REACTIVATE_MEMBERSHIP}
            refetchQueries={refetchQueries}
          >
            {(reactivateMembership, { loading, error }) => {
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
                          onClick={this.submitHandler(reactivateMembership)}
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
