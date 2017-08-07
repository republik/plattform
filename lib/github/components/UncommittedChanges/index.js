import React from 'react'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'

import { colors } from '@project-r/styleguide'

const styles = {
  list: css({
    listStyleType: 'none',
    margin: 0,
    maxHeight: '300px',
    overflow: 'scroll',
    padding: 0
  }),
  change: css({
    backgroundColor: colors.secondaryBg,
    borderBottom: `1px solid ${colors.divider}`,
    fontSize: '13px',
    padding: '5px',
    position: 'relative'
  })
}

const query = gql`
  query uncommittedChanges(
    $login: String!
    $repository: String!
    $filename: String!
  ) {
    repository(owner: $login, name: $repository) {
      uncommittedChanges(path: $filename) {
        id
        email
      }
    }
  }
`

const UncommittedChanges = ({ data: { loading, error, repository }, path }) => {
  // TODO: Implement live subscription.
  if (loading) {
    return <div>Loading</div>
  }

  let uncommittedChanges

  try {
    uncommittedChanges = repository.uncommittedChanges
  } catch (e) {}

  if (uncommittedChanges && uncommittedChanges.length) {
    return (
      <div>
        <ul {...styles.list}>
          {uncommittedChanges.map(change =>
            <li key={change.id} {...styles.change}>
              <a>
                {change.email}
              </a>
            </li>
          )}
        </ul>
      </div>
    )
  } else {
    return (
      <div>
        <i>No changes</i>
      </div>
    )
  }
}

export default graphql(query, {
  options: ({ login, repository, path }) => ({
    variables: {
      login,
      repository,
      filename: path.split('/').slice(1).join('/')
    }
  })
})(UncommittedChanges)
