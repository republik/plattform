import { Component } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Loader,
  InlineSpinner,
} from '@project-r/styleguide'

import {
  InteractiveSection,
  SectionMenu,
  DL,
  DT,
  DD,
  TextButton,
} from '../../Display/utils'

import EmailForm from './EmailForm'
import { IconEdit } from '@republik/icons'

const GET_EMAIL = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      email
    }
  }
`

const UPDATE_EMAIL = gql`
  mutation updateEmail($id: ID!, $email: String!) {
    updateEmail(userId: $id, email: $email) {
      id
      email
    }
  }
`

const UpdateEmail = ({ user, onSubmit, ...props }) => (
  <Mutation {...props} mutation={UPDATE_EMAIL} variables={{ id: user.id }}>
    {(updateUser, { loading, error }) => {
      return (
        <Loader
          loading={loading}
          error={error}
          render={() => (
            <EmailForm
              key={user.id}
              user={user}
              onSubmit={(variables) => onSubmit(updateUser({ variables }))}
            />
          )}
        />
      )
    }}
  </Mutation>
)

const EmailCard = ({ user }) => (
  <DL>
    <DT>E-Mail Adresse</DT>
    <DD>{user.email}</DD>
  </DL>
)

export default class Email extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: false,
    }

    this.closeHandler = () => this.setState({ isOpen: false })
    this.openHandler = () => this.setState({ isOpen: true })
  }

  render() {
    const { userId } = this.props
    const { isOpen } = this.state
    return (
      <Query query={GET_EMAIL} variables={{ id: userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading = loading && !(data && data.user)
          const isLoading = loading && !isInitialLoading

          return (
            <Loader
              loading={isInitialLoading}
              error={isInitialLoading && error}
              render={() => {
                const { user } = data
                return (
                  <InteractiveSection>
                    <EmailCard user={user} />
                    <SectionMenu>
                      {isLoading && (
                        <div>
                          <InlineSpinner size={28} />
                        </div>
                      )}
                      <TextButton
                        className='show-on-focus'
                        onClick={this.openHandler}
                      >
                        <IconEdit size={28} />
                      </TextButton>
                    </SectionMenu>
                    {isOpen && (
                      <Overlay onClose={this.closeHandler}>
                        <OverlayToolbar onClose={this.closeHandler} />
                        <OverlayBody>
                          <UpdateEmail
                            user={user}
                            onSubmit={(promise) =>
                              promise.then(this.closeHandler)
                            }
                          />
                        </OverlayBody>
                      </Overlay>
                    )}
                  </InteractiveSection>
                )
              }}
            />
          )
        }}
      </Query>
    )
  }
}
