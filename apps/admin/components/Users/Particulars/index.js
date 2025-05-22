import { Component, Fragment } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  Loader,
  InlineSpinner,
} from '@project-r/styleguide'
import { IconEdit } from '@republik/icons'

import {
  InteractiveSection,
  SectionMenu,
  SectionTitle,
  DL,
  DT,
  DD,
  TextButton,
} from '../../Display/utils'

import UserForm from './UserForm'

import { GET_PROFILE } from '../ProfileHeader'

export const GET_USER = gql`
  query user($id: String) {
    user(slug: $id) {
      id
      name
      phoneNumber
      firstName
      lastName
      birthyear
      gender
      address {
        id
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

export const UPDATE_USER = gql`
  mutation updateUser(
    $id: ID!
    $birthyear: Int
    $firstName: String!
    $lastName: String!
    $phoneNumber: String
    $gender: String
    $address: AddressInput!
  ) {
    updateUser(
      userId: $id
      birthyear: $birthyear
      firstName: $firstName
      lastName: $lastName
      phoneNumber: $phoneNumber
      gender: $gender
      address: $address
    ) {
      id
      name
      firstName
      lastName
      phoneNumber
      birthyear
      gender
      address {
        id
        name
        line1
        line2
        postalCode
        city
        country
      }
    }
  }
`

const UpdateUser = ({ user, onSubmit, ...props }) => (
  <Mutation
    {...props}
    mutation={UPDATE_USER}
    refetchQueries={({ data: { updateUser } }) => [
      {
        query: GET_USER,
        variables: {
          id: updateUser.id,
        },
      },
      {
        query: GET_PROFILE,
        variables: {
          id: updateUser.id,
        },
      },
    ]}
    variables={{ id: user.id }}
  >
    {(updateUser, { loading, error }) => {
      return (
        <Loader
          loading={loading}
          error={error}
          render={() => (
            <UserForm
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

const UserCard = ({ user }) => {
  const postalCodeAndCity =
    user.address &&
    [user.address.postalCode, user.address.city].filter(Boolean).join(' ')
  return (
    <Fragment>
      <DL>
        <DT>Name</DT>
        <DD>
          {(user.firstName &&
            user.lastName &&
            `${user.firstName} ${user.lastName}`) ||
            user.name ||
            'Unbekannt'}
        </DD>
      </DL>
      {user.birthyear && (
        <DL>
          <DT>Geburtsjahr</DT>
          <DD>{user.birthyear}</DD>
        </DL>
      )}
      {user.gender && (
        <DL>
          <DT>Gender</DT>
          <DD>{user.gender}</DD>
        </DL>
      )}
      <DL>
        <DT>Adresse</DT>
        {!user.address ? (
          <DD>Keine Angaben</DD>
        ) : (
          <Fragment>
            <DD>{user.address.name}</DD>
            <DD>{user.address.line1}</DD>
            {user.address.line2 && <DD>{user.address.line2}</DD>}
            {postalCodeAndCity && <DD>{postalCodeAndCity}</DD>}
            {user.address.country && <DD>{user.address.country}</DD>}
          </Fragment>
        )}
      </DL>
      {user.phoneNumber && (
        <DL>
          <DT>Telefon-Nr.</DT>
          <DD>{user.phoneNumber}</DD>
        </DL>
      )}
    </Fragment>
  )
}

export default class User extends Component {
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
      <Query query={GET_USER} variables={{ id: userId }}>
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
                    <SectionTitle>Personalien</SectionTitle>
                    <UserCard user={user} />
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
                          <UpdateUser
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
