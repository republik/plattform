import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { Component, Fragment } from 'react'

import { Interaction, Label, Loader } from '@project-r/styleguide'

import { displayDateTime, TextButton } from '@/components/Display/utils'
import SearchUser from '@/components/Form/SearchUser'
import { Button, SimpleDialog } from '@republik/ui'

const MOVE_PLEDGE = gql`
  mutation movePledge($pledgeId: ID!, $userId: ID!) {
    movePledge(pledgeId: $pledgeId, userId: $userId) {
      id
    }
  }
`

export default class MovePledge extends Component {
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
          pledgeId: this.props.pledge.id,
          userId: this.state.user.id,
        },
      }).then(() => this.setState(() => ({ user: null, isOpen: false })))
    }
  }

  render() {
    const { isOpen, user } = this.state
    const { pledge, refetchQueries } = this.props
    return (
      <div>
        <TextButton
          onClick={() => {
            this.setState({ isOpen: true })
          }}
        >
          Verschieben
        </TextButton>

        {isOpen && (
          <Mutation mutation={MOVE_PLEDGE} refetchQueries={refetchQueries}>
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
                        <Interaction.H2>Pledge verschieben</Interaction.H2>
                        <br />
                        <Interaction.H3>
                          {pledge.package.name.split('_').join(' ')} –{' '}
                          {displayDateTime(pledge.createdAt)} – {pledge.status}
                          <br />
                          <Label>
                            Created:{' '}
                            {displayDateTime(new Date(pledge.createdAt))}
                            {' – '}
                            Updated:{' '}
                            {displayDateTime(new Date(pledge.updatedAt))}
                          </Label>
                        </Interaction.H3>
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
      </div>
    )
  }
}
