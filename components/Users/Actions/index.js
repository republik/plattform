import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Loader,
  InlineSpinner
} from '@project-r/styleguide'

import {
  displayDate,
  displayStyles,
  displayDateTime,
  Section,
  SectionTitle,
  DL,
  DT,
  DD
} from '../../Display/utils'
import DeleteUser from './DeleteUser';

const GET_ACTIONS = gql`
  query actions($id: String) {
    user(slug: $id) {
      id
      deletedAt
    }
  }
`

export default class Actions extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Query query={GET_ACTIONS} variables={{ id: this.props.userId }}>
        {({ loading, error, data }) => {
          const isInitialLoading =
            loading && !(data && data.user)
          const isLoading = loading && !isInitialLoading

          return (
            <Loader
              loading={isInitialLoading}
              error={isInitialLoading && error}
              render={() => {
                const { user } = data
                return (
                  <Section>
                    <SectionTitle>Aktionen</SectionTitle>
                    {!!isLoading && (
                      <div>
                        <InlineSpinner size={28} />
                      </div>
                    )}
                    {!isLoading && (
                      <DeleteUser
                        userId={user.id}
                        deletedAt={user.deletedAt}
                        refetchQueries={({
                          data: { deleteUser }
                        }) => [
                          {
                            query: GET_ACTIONS,
                            variables: { id: user.id }
                          }
                        ]}
                        />
                    )}
                  </Section>
                )
              }}
            />
          )
        }}
      </Query>
    )
  }
}
