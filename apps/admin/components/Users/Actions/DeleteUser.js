import React, { Component, Fragment } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Checkbox,
  Interaction,
  Loader,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'

import { displayDate, SectionSubhead, TextButton } from '../../Display/utils'

const DELETE_USER = gql`
  mutation deleteUser($userId: ID!, $unpublishComments: Boolean!) {
    deleteUser(userId: $userId, unpublishComments: $unpublishComments) {
      id
    }
  }
`

export default class DeleteUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
      isDeleted: true,
      unpublishComments: false,
    }

    this.closeHandler = () => {
      this.setState(() => ({ isOpen: false, unpublishComments: false }))
    }

    this.submitHandler = (mutation) => () => {
      return mutation({
        variables: {
          userId: this.props.userId,
          unpublishComments: !!this.state.unpublishComments,
        },
      }).then(() => window.location.replace('/users'))
    }
  }

  render() {
    const { isOpen, unpublishComments } = this.state
    const { deletedAt, refetchQueries } = this.props
    return (
      <Fragment>
        {!!deletedAt && (
          <SectionSubhead>
            Nutzer gelöscht am {displayDate(deletedAt)}
          </SectionSubhead>
        )}
        {!deletedAt && (
          <TextButton
            onClick={() => {
              this.setState({ isOpen: true })
            }}
          >
            löschen
          </TextButton>
        )}

        {isOpen && !deletedAt && (
          <Mutation mutation={DELETE_USER} refetchQueries={refetchQueries}>
            {(deleteUser, { loading, error }) => {
              return (
                <Overlay onClose={this.closeHandler}>
                  <OverlayToolbar onClose={this.closeHandler} />
                  <OverlayBody>
                    <Loader
                      loading={loading}
                      error={error}
                      render={() => (
                        <Fragment>
                          <Interaction.H2>User löschen</Interaction.H2>
                          <br />
                          <Checkbox
                            checked={unpublishComments}
                            onChange={(_, checked) =>
                              this.setState({
                                unpublishComments: checked,
                              })
                            }
                          >
                            Dialoginhalte löschen
                          </Checkbox>
                          <br />
                          <br />
                          <Button
                            primary
                            onClick={this.submitHandler(deleteUser)}
                          >
                            User löschen
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
