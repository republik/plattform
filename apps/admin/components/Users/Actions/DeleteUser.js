import { gql } from '@apollo/client'
import { Mutation } from '@apollo/client/react/components'
import { Component, Fragment } from 'react'

import { Checkbox, Loader } from '@project-r/styleguide'

import {
  displayDate,
  SectionSubhead,
  TextButton,
} from '@/components/Display/utils'
import { Button, SimpleDialog } from '@/components/ui'

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

        {!deletedAt && (
          <Mutation mutation={DELETE_USER} refetchQueries={refetchQueries}>
            {(deleteUser, { loading, error }) => {
              return (
                <SimpleDialog
                  title={'Nutzer löschen'}
                  open={isOpen}
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
                        <Button onClick={this.submitHandler(deleteUser)}>
                          User löschen
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
