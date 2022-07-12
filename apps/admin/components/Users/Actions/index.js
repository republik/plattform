import { Component } from 'react'
import { Query, Mutation } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

import { Loader, InlineSpinner } from '@project-r/styleguide'

import { Section, SectionTitle } from '../../Display/utils'
import DeleteUser from './DeleteUser'

const GET_ACTIONS = gql`
  query actions($slug: String) {
    user(slug: $slug) {
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
      <Query query={GET_ACTIONS} variables={{ slug: this.props.userId }}>
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
                  <Section>
                    <SectionTitle>Aktionen</SectionTitle>
                    {isLoading && (
                      <div>
                        <InlineSpinner size={28} />
                      </div>
                    )}
                    {!isLoading && (
                      <DeleteUser userId={user.id} deletedAt={user.deletedAt} />
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
